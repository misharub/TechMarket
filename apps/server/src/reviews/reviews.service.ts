import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { FindReviewsDto } from "./dto/find-reviews.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) {}

    async findProductReviews(productId: string, query: FindReviewsDto) {
        await this.ensureProductExists(productId);

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = { productId, isActive: true };

        const [items, total, rating] = await this.prisma.$transaction([
            this.prisma.review.findMany({
                where,
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where }),
            this.prisma.review.aggregate({
                where,
                _avg: { rating: true },
                _count: { rating: true },
            }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            rating: {
                average: this.roundRating(rating._avg.rating),
                count: rating._count.rating,
            },
        };
    }

    async create(productId: string, userId: string, dto: CreateReviewDto) {
        await this.ensureUserCanReview(userId);
        await this.ensureProductExists(productId);

        const existingReview = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingReview?.isActive) {
            throw new ConflictException("User has already reviewed this product");
        }

        if (existingReview) {
            return this.prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating: dto.rating,
                    comment: dto.comment,
                    isActive: true,
                },
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
            });
        }

        return this.prisma.review.create({
            data: {
                productId,
                userId,
                rating: dto.rating,
                comment: dto.comment,
            },
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
        const review = await this.ensureReviewBelongsToUser(reviewId, userId);

        if (!review.isActive) {
            throw new NotFoundException("Review not found");
        }

        return this.prisma.review.update({
            where: { id: reviewId },
            data: dto,
                include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    async remove(reviewId: string, user: { id: string; role: string }) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true, userId: true, isActive: true },
        });

        if (!review || !review.isActive) {
            throw new NotFoundException("Review not found");
        }

        if (review.userId !== user.id && user.role !== Role.ADMIN) {
            throw new ForbiddenException("You cannot delete this review");
        }

        // Отзыв скрывается мягко, чтобы не терять историю пользовательского контента.
        return this.prisma.review.update({
            where: { id: reviewId },
            data: { isActive: false },
        });
    }

    private async ensureProductExists(productId: string) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }
    }

    private async ensureUserCanReview(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isBlocked: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.isBlocked) {
            throw new ForbiddenException("Blocked user cannot create reviews");
        }
    }

    private async ensureReviewBelongsToUser(reviewId: string, userId: string) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, userId },
        });

        if (!review) {
            throw new NotFoundException("Review not found");
        }

        return review;
    }

    private roundRating(value: number | null) {
        return value === null ? 0 : Number(value.toFixed(2));
    }
}
