import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";

@Injectable()
export class WishlistService {
    constructor(private readonly prisma: PrismaService) {}

    // Избранное привязано к пользователю, поэтому service всегда получает userId из JWT, а не из body.
    async findAll(userId: string) {
        const items = await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { items };
    }

    async add(userId: string, dto: AddWishlistItemDto) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: dto.productId,
                isActive: true,
            },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const existingItem = await this.prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId: dto.productId } },
            include: { product: { include: { brand: true, category: true } } },
        });

        // Повторное добавление возвращает существующую запись и не создает дубль в базе.
        if (existingItem) {
            return existingItem;
        }

        return this.prisma.wishlistItem.create({
            data: {
                userId,
                productId: dto.productId,
            },
            include: { product: { include: { brand: true, category: true } } },
        });
    }

    async remove(userId: string, productId: string) {
        const result = await this.prisma.wishlistItem.deleteMany({
            where: {
                userId,
                productId,
            },
        });

        return { deleted: result.count };
    }
}
