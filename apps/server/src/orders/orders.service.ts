import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { PromoCodesService } from "../promo-codes/promo-codes.service";
import { PrismaService } from "../prisma/prisma.service";
import { CheckoutOrderDto } from "./dto/checkout-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly promoCodesService: PromoCodesService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(userId: string, dto: CheckoutOrderDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, isBlocked: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.isBlocked) {
            throw new ForbiddenException("Blocked user cannot create orders");
        }

        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: "asc" },
        });

        if (!cartItems.length) {
            throw new BadRequestException("Cart is empty");
        }

        const deliveryAddress = await this.resolveDeliveryAddress(userId, dto);

        for (const item of cartItems) {
            if (!item.product.isActive) {
                throw new BadRequestException(`Product is not available: ${item.product.title}`);
            }

            if (item.quantity > item.product.stock) {
                throw new BadRequestException(`Not enough stock for product: ${item.product.title}`);
            }
        }

        const subtotal = this.calculateTotal(cartItems);
        const promo = await this.promoCodesService.validateForSubtotal(dto.promoCode, subtotal);

        const order = await this.prisma.$transaction(async (tx) => {
            if (promo.promoCode) {
                await this.promoCodesService.incrementUsage(promo.promoCode.id, tx);
            }

            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice: promo.totalPrice,
                    discountAmount: promo.discountAmount,
                    promoCodeId: promo.promoCode?.id,
                    promoCodeCode: promo.code,
                    customerName: dto.customerName,
                    customerPhone: dto.customerPhone,
                    customerEmail: dto.customerEmail,
                    city: deliveryAddress.city,
                    deliveryAddress: deliveryAddress.deliveryAddress,
                    deliveryMethod: dto.deliveryMethod,
                    paymentMethod: dto.paymentMethod,
                    comment: dto.comment,
                },
            });

            for (const item of cartItems) {
                const stockUpdate = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        isActive: true,
                        stock: { gte: item.quantity },
                    },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });

                if (stockUpdate.count !== 1) {
                    throw new BadRequestException(`Not enough stock for product: ${item.product.title}`);
                }

                await tx.orderItem.create({
                    data: {
                        orderId: createdOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    },
                });
            }

            await tx.cartItem.deleteMany({
                where: { userId },
            });

            return createdOrder;
        });

        const createdOrder = await this.findUserOrder(userId, order.id);

        await this.notifyOrderCreated(user, order.id);

        return createdOrder;
    }

    findUserOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: this.orderInclude(),
            orderBy: { createdAt: "desc" },
        });
    }

    async findUserOrder(userId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: this.orderInclude(),
        });

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        return order;
    }

    findAllAdmin() {
        return this.prisma.order.findMany({
            include: this.adminOrderInclude(),
            orderBy: { createdAt: "desc" },
        });
    }

    async findOneAdmin(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: this.adminOrderInclude(),
        });

        if (!order) {
            throw new NotFoundException("Order not found");
        }

        return order;
    }

    async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
        await this.ensureOrderExists(orderId);

        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: dto.status },
            include: this.adminOrderInclude(),
        });

        await this.notifyOrderStatusChanged(order.userId, order.user.email, order.id, dto.status);

        return order;
    }

    private async notifyOrderCreated(user: { id: string; email: string; name: string }, orderId: string) {
        try {
            await this.notificationsService.createUserNotification({
                userId: user.id,
                type: NotificationType.ORDER_CREATED,
                title: `Заказ ${orderId} создан`,
                message: `Ваш заказ ${orderId} успешно создан. Статус заказа: NEW.`,
                email: {
                    to: user.email,
                    subject: `TechMarket: заказ ${orderId} создан`,
                    body: `Здравствуйте, ${user.name}. Ваш заказ ${orderId} успешно создан и ожидает обработки.`,
                },
            });
        } catch (error) {
            console.error("Failed to create order notification", error);
        }
    }

    private async notifyOrderStatusChanged(userId: string, userEmail: string, orderId: string, status: string) {
        try {
            await this.notificationsService.createUserNotification({
                userId,
                type: NotificationType.ORDER_STATUS_CHANGED,
                title: `Статус заказа ${orderId} изменен`,
                message: `Статус заказа ${orderId} изменен на ${status}.`,
                email: {
                    to: userEmail,
                    subject: `TechMarket: новый статус заказа ${orderId}`,
                    body: `Статус вашего заказа ${orderId} изменен на ${status}.`,
                },
            });
        } catch (error) {
            console.error("Failed to create order status notification", error);
        }
    }

    private async ensureOrderExists(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true },
        });

        if (!order) {
            throw new NotFoundException("Order not found");
        }
    }

    private calculateTotal(items: Array<{ quantity: number; product: { price: unknown } }>) {
        return Number(items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2));
    }

    private async resolveDeliveryAddress(userId: string, dto: CheckoutOrderDto) {
        if (dto.addressId) {
            const address = await this.prisma.address.findFirst({
                where: {
                    id: dto.addressId,
                    userId,
                },
            });

            if (!address) {
                throw new NotFoundException("Address not found");
            }

            return {
                city: address.city,
                deliveryAddress: this.formatAddress(address),
            };
        }

        if (!dto.city || !dto.deliveryAddress) {
            throw new BadRequestException("Either addressId or city and deliveryAddress must be provided");
        }

        return {
            city: dto.city,
            deliveryAddress: dto.deliveryAddress,
        };
    }

    private formatAddress(address: {
        street: string;
        house: string;
        apartment: string | null;
        zipCode: string | null;
    }) {
        return [
            address.street,
            `дом ${address.house}`,
            address.apartment ? `кв. ${address.apartment}` : null,
            address.zipCode ? `индекс ${address.zipCode}` : null,
        ]
            .filter(Boolean)
            .join(", ");
    }

    private orderInclude() {
        return {
            promoCode: true,
            items: {
                include: {
                    product: {
                        include: { brand: true, category: true },
                    },
                },
            },
        };
    }

    private adminOrderInclude() {
        return {
            user: true,
            promoCode: true,
            items: {
                include: {
                    product: {
                        include: { brand: true, category: true },
                    },
                },
            },
        };
    }
}
