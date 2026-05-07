import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { FindPromoCodesDto } from "./dto/find-promo-codes.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { ValidatePromoCodeDto } from "./dto/validate-promo-code.dto";

type PromoClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PromoCodesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(query: FindPromoCodesDto) {
        return this.prisma.promoCode.findMany({
            where: {
                ...(query.includeInactive ? {} : { isActive: true }),
                ...(query.search
                    ? {
                          code: {
                              contains: query.search,
                              mode: "insensitive",
                          },
                      }
                    : {}),
            },
            orderBy: [{ createdAt: "desc" }],
        });
    }

    async create(dto: CreatePromoCodeDto) {
        this.validatePromoShape(dto);

        try {
            return await this.prisma.promoCode.create({
                data: {
                    ...dto,
                    code: this.normalizeCode(dto.code),
                    isActive: dto.isActive ?? true,
                },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdatePromoCodeDto) {
        const currentPromoCode = await this.ensurePromoCodeExists(id);
        this.validatePromoShape({
            discountType: dto.discountType ?? currentPromoCode.discountType,
            value: dto.value ?? Number(currentPromoCode.value),
            startsAt: dto.startsAt ?? currentPromoCode.startsAt ?? undefined,
            endsAt: dto.endsAt ?? currentPromoCode.endsAt ?? undefined,
        });

        try {
            return await this.prisma.promoCode.update({
                where: { id },
                data: {
                    ...dto,
                    ...(dto.code ? { code: this.normalizeCode(dto.code) } : {}),
                },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.ensurePromoCodeExists(id);

        return this.prisma.promoCode.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async validateForUserCart(userId: string, dto: ValidatePromoCodeDto) {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (!cartItems.length) {
            throw new BadRequestException("Cart is empty");
        }

        const subtotal = this.calculateSubtotal(cartItems);
        return this.toPublicValidation(await this.validateForSubtotal(dto.code, subtotal));
    }

    async validateForSubtotal(code: string | undefined, subtotal: number, client: PromoClient = this.prisma) {
        if (!code) {
            return {
                promoCode: null,
                code: null,
                discountType: null,
                subtotal,
                discountAmount: 0,
                totalPrice: subtotal,
            };
        }

        const promoCode = await client.promoCode.findUnique({
            where: { code: this.normalizeCode(code) },
        });

        if (!promoCode) {
            throw new BadRequestException("Promo code is invalid");
        }

        this.ensurePromoCodeCanBeUsed(promoCode, subtotal);
        const discountAmount = this.calculateDiscount(promoCode, subtotal);

        return {
            promoCode,
            code: promoCode.code,
            discountType: promoCode.discountType,
            subtotal,
            discountAmount,
            totalPrice: Number((subtotal - discountAmount).toFixed(2)),
        };
    }

    async incrementUsage(promoCodeId: string, client: PromoClient = this.prisma) {
        const promoCode = await client.promoCode.findUnique({
            where: { id: promoCodeId },
            select: {
                id: true,
                isActive: true,
                usageLimit: true,
                usedCount: true,
            },
        });

        if (!promoCode || !promoCode.isActive) {
            throw new BadRequestException("Promo code is invalid");
        }

        if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
            throw new BadRequestException("Promo code usage limit has been reached");
        }

        const result = await client.promoCode.updateMany({
            where: {
                id: promoCodeId,
                isActive: true,
                ...(promoCode.usageLimit === null ? {} : { usedCount: { lt: promoCode.usageLimit } }),
            },
            data: {
                usedCount: { increment: 1 },
            },
        });

        if (result.count !== 1) {
            throw new BadRequestException("Promo code usage limit has been reached");
        }
    }

    private calculateSubtotal(items: Array<{ quantity: number; product: { price: unknown } }>) {
        return Number(items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2));
    }

    private ensurePromoCodeCanBeUsed(
        promoCode: {
            isActive: boolean;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usedCount: number;
            minOrderTotal: unknown;
        },
        subtotal: number,
    ) {
        const now = new Date();

        if (!promoCode.isActive) {
            throw new BadRequestException("Promo code is inactive");
        }

        if (promoCode.startsAt && promoCode.startsAt > now) {
            throw new BadRequestException("Promo code is not active yet");
        }

        if (promoCode.endsAt && promoCode.endsAt < now) {
            throw new BadRequestException("Promo code has expired");
        }

        if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
            throw new BadRequestException("Promo code usage limit has been reached");
        }

        const minOrderTotal = Number(promoCode.minOrderTotal ?? 0);
        if (subtotal < minOrderTotal) {
            throw new BadRequestException("Order total is too low for this promo code");
        }
    }

    private calculateDiscount(
        promoCode: {
            discountType: DiscountType;
            value: unknown;
            maxDiscount: unknown;
        },
        subtotal: number,
    ) {
        const value = Number(promoCode.value);
        const rawDiscount = promoCode.discountType === DiscountType.PERCENT ? (subtotal * value) / 100 : value;
        const maxDiscount = promoCode.maxDiscount === null ? rawDiscount : Math.min(rawDiscount, Number(promoCode.maxDiscount));
        const discount = Math.min(maxDiscount, subtotal);

        return Number(discount.toFixed(2));
    }

    private validatePromoShape(dto: { discountType?: DiscountType; value?: number; startsAt?: Date; endsAt?: Date }) {
        if (dto.discountType === DiscountType.PERCENT && dto.value !== undefined && dto.value > 100) {
            throw new BadRequestException("Percent discount must not exceed 100");
        }

        if (dto.startsAt && dto.endsAt && dto.startsAt >= dto.endsAt) {
            throw new BadRequestException("startsAt must be earlier than endsAt");
        }
    }

    private normalizeCode(code: string) {
        return code.trim().toUpperCase();
    }

    private toPublicValidation(validation: {
        code: string | null;
        discountType: DiscountType | null;
        subtotal: number;
        discountAmount: number;
        totalPrice: number;
    }) {
        return {
            code: validation.code,
            discountType: validation.discountType,
            subtotal: validation.subtotal,
            discountAmount: validation.discountAmount,
            totalPrice: validation.totalPrice,
        };
    }

    private async ensurePromoCodeExists(id: string) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { id },
        });

        if (!promoCode) {
            throw new NotFoundException("Promo code not found");
        }
        return promoCode;
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Promo code already exists");
        }

        throw error;
    }
}
