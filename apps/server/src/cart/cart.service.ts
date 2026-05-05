import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

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
            totalPrice: this.calculateCartTotal(items),
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
                data: { quantity: nextQuantity },
                include: { product: { include: { brand: true, category: true } } },
            });
        }

        return this.prisma.cartItem.create({
            data: {
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
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
            data: { quantity: dto.quantity },
            include: { product: { include: { brand: true, category: true } } },
        });
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
