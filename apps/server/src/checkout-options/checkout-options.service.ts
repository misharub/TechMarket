import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DeliveryScenario, PickupPointType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryMethodDto } from "./dto/create-delivery-method.dto";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdateDeliveryMethodDto } from "./dto/update-delivery-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";

@Injectable()
export class CheckoutOptionsService {
    constructor(private readonly prisma: PrismaService) {}

    findActiveDeliveryMethods() {
        return this.prisma.deliveryMethod.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    findAllDeliveryMethods() {
        return this.prisma.deliveryMethod.findMany({
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    async createDeliveryMethod(dto: CreateDeliveryMethodDto) {
        try {
            return await this.prisma.deliveryMethod.create({ data: dto });
        } catch (error) {
            this.handleUniqueError(error, "Delivery method code already exists");
        }
    }

    async updateDeliveryMethod(id: string, dto: UpdateDeliveryMethodDto) {
        await this.ensureDeliveryMethodExists(id);

        try {
            return await this.prisma.deliveryMethod.update({ where: { id }, data: dto });
        } catch (error) {
            this.handleUniqueError(error, "Delivery method code already exists");
        }
    }

    async removeDeliveryMethod(id: string) {
        await this.ensureDeliveryMethodExists(id);

        return this.prisma.deliveryMethod.update({
            where: { id },
            data: { isActive: false },
        });
    }

    findActivePaymentMethods() {
        return this.prisma.paymentMethod.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    findActivePickupPoints(scenario?: DeliveryScenario) {
        return this.prisma.pickupPoint.findMany({
            where: {
                isActive: true,
                ...(scenario ? { type: this.pickupPointTypeForScenario(scenario) } : {}),
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    findAllPaymentMethods() {
        return this.prisma.paymentMethod.findMany({
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    async createPaymentMethod(dto: CreatePaymentMethodDto) {
        try {
            return await this.prisma.paymentMethod.create({ data: dto });
        } catch (error) {
            this.handleUniqueError(error, "Payment method code already exists");
        }
    }

    async updatePaymentMethod(id: string, dto: UpdatePaymentMethodDto) {
        await this.ensurePaymentMethodExists(id);

        try {
            return await this.prisma.paymentMethod.update({ where: { id }, data: dto });
        } catch (error) {
            this.handleUniqueError(error, "Payment method code already exists");
        }
    }

    async removePaymentMethod(id: string) {
        await this.ensurePaymentMethodExists(id);

        return this.prisma.paymentMethod.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async validateDeliveryMethod(code: string, subtotal: number) {
        const deliveryMethod = await this.prisma.deliveryMethod.findUnique({ where: { code } });

        if (!deliveryMethod || !deliveryMethod.isActive) {
            throw new BadRequestException("Delivery method is not available");
        }

        if (deliveryMethod.minOrderTotal !== null && subtotal < Number(deliveryMethod.minOrderTotal)) {
            throw new BadRequestException("Order total is too low for this delivery method");
        }

        return deliveryMethod;
    }

    async validatePaymentMethod(code: string) {
        const paymentMethod = await this.prisma.paymentMethod.findUnique({ where: { code } });

        if (!paymentMethod || !paymentMethod.isActive) {
            throw new BadRequestException("Payment method is not available");
        }

        return paymentMethod;
    }

    async validatePickupPoint(scenario: DeliveryScenario, pickupPointId: string) {
        const pickupPoint = await this.prisma.pickupPoint.findUnique({
            where: { id: pickupPointId },
        });

        if (!pickupPoint || !pickupPoint.isActive || pickupPoint.type !== this.pickupPointTypeForScenario(scenario)) {
            throw new BadRequestException("Pickup point is not available");
        }

        return pickupPoint;
    }

    private async ensureDeliveryMethodExists(id: string) {
        const deliveryMethod = await this.prisma.deliveryMethod.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!deliveryMethod) {
            throw new NotFoundException("Delivery method not found");
        }
    }

    private async ensurePaymentMethodExists(id: string) {
        const paymentMethod = await this.prisma.paymentMethod.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!paymentMethod) {
            throw new NotFoundException("Payment method not found");
        }
    }

    private handleUniqueError(error: unknown, message: string): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException(message);
        }

        throw error;
    }

    private pickupPointTypeForScenario(scenario: DeliveryScenario) {
        if (scenario === DeliveryScenario.STORE_PICKUP) {
            return PickupPointType.STORE;
        }

        if (scenario === DeliveryScenario.PICKUP_POINT) {
            return PickupPointType.PICKUP_POINT;
        }

        throw new BadRequestException("Pickup point is not available for courier delivery");
    }
}
