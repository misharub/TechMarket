import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { MergeCartItemDto } from "./dto/merge-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { UpdateCartSelectionDto } from "./dto/update-cart-selection.dto";

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(userId: string) {
        const items = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: { include: { brand: true, category: true } } },
            orderBy: { createdAt: "asc" },
        });

        return {
            items,
            totalPrice: this.calculateCartTotal(items.filter((item) => item.isSelected)),
            itemsCount: items.length,
            selectedItemsCount: items.filter((item) => item.isSelected).length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            selectedQuantity: items.filter((item) => item.isSelected).reduce((sum, item) => sum + item.quantity, 0),
        };
    }

    async addItem(userId: string, dto: AddCartItemDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product || !product.isActive) {
            throw new NotFoundException("Product not found");
        }

        if (product.stock <= 0) {
            throw new BadRequestException("Product is out of stock");
        }

        const existingItem = await this.prisma.cartItem.findUnique({
            where: { userId_productId: { userId, productId: dto.productId } },
        });
        const nextQuantity = (existingItem?.quantity ?? 0) + dto.quantity;

        if (nextQuantity > product.stock) {
            throw new BadRequestException("Requested quantity exceeds product stock");
        }

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: nextQuantity, isSelected: true },
                include: { product: { include: { brand: true, category: true } } },
            });
        }

        return this.prisma.cartItem.create({
            data: {
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
                isSelected: true,
            },
            include: { product: { include: { brand: true, category: true } } },
        });
    }

    async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
        const item = await this.ensureCartItemBelongsToUser(userId, itemId);

        if (!item.product.isActive) {
            throw new BadRequestException("Product is not available");
        }

        if (dto.quantity > item.product.stock) {
            throw new BadRequestException("Requested quantity exceeds product stock");
        }

        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity, ...(dto.isSelected === undefined ? {} : { isSelected: dto.isSelected }) },
            include: { product: { include: { brand: true, category: true } } },
        });
    }

    async mergeGuestItems(userId: string, guestItems: MergeCartItemDto[]) {
        const productIds = [...new Set(guestItems.map((item) => item.productId))];
        const [products, existingItems] = await Promise.all([
            this.prisma.product.findMany({
                where: { id: { in: productIds }, isActive: true },
                select: { id: true, stock: true, isActive: true },
            }),
            this.prisma.cartItem.findMany({
                where: { userId, productId: { in: productIds } },
            }),
        ]);

        const productsById = new Map(products.map((product) => [product.id, product]));
        const existingByProductId = new Map(existingItems.map((item) => [item.productId, item]));

        for (const guestItem of guestItems) {
            const product = productsById.get(guestItem.productId);
            if (!product || product.stock <= 0) {
                continue;
            }

            const existingItem = existingByProductId.get(guestItem.productId);
            const nextQuantity = Math.min(product.stock, (existingItem?.quantity ?? 0) + guestItem.quantity);
            const isSelected = (existingItem?.isSelected ?? false) || (guestItem.isSelected ?? true);

            if (existingItem) {
                await this.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: nextQuantity, isSelected },
                });
                continue;
            }

            await this.prisma.cartItem.create({
                data: {
                    userId,
                    productId: guestItem.productId,
                    quantity: Math.min(product.stock, guestItem.quantity),
                    isSelected: guestItem.isSelected ?? true,
                },
            });
        }

        return this.findAll(userId);
    }

    async updateSelection(userId: string, dto: UpdateCartSelectionDto) {
        const result = await this.prisma.cartItem.updateMany({
            where: {
                userId,
                ...(dto.itemIds?.length ? { id: { in: dto.itemIds } } : {}),
            },
            data: { isSelected: dto.isSelected },
        });

        return {
            updated: result.count,
        };
    }

    async removeItem(userId: string, itemId: string) {
        await this.ensureCartItemBelongsToUser(userId, itemId);

        return this.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }

    async clear(userId: string) {
        const result = await this.prisma.cartItem.deleteMany({
            where: { userId },
        });

        return {
            deleted: result.count,
        };
    }

    async removeSelected(userId: string) {
        const result = await this.prisma.cartItem.deleteMany({
            where: { userId, isSelected: true },
        });

        return {
            deleted: result.count,
        };
    }

    private async ensureCartItemBelongsToUser(userId: string, itemId: string) {
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, userId },
            include: { product: true },
        });

        if (!item) {
            throw new NotFoundException("Cart item not found");
        }

        return item;
    }

    private calculateCartTotal(items: Array<{ quantity: number; product: { price: unknown } }>) {
        return Number(
            items
                .reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
                .toFixed(2),
        );
    }
}
