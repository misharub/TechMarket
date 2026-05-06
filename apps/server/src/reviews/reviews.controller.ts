import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { FindReviewsDto } from "./dto/find-reviews.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("Reviews")
@Controller()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get("products/:productId/reviews")
    @ApiOperation({ summary: "Получить отзывы товара" })
    findProductReviews(@Param("productId") productId: string, @Query() query: FindReviewsDto) {
        return this.reviewsService.findProductReviews(productId, query);
    }

    @Post("products/:productId/reviews")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Оставить отзыв о товаре" })
    create(@CurrentUser() user: RequestUser, @Param("productId") productId: string, @Body() dto: CreateReviewDto) {
        return this.reviewsService.create(productId, user.id, dto);
    }

    @Patch("reviews/:id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить свой отзыв" })
    update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateReviewDto) {
        return this.reviewsService.update(id, user.id, dto);
    }

    @Delete("reviews/:id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Скрыть отзыв. Пользователь может удалить свой отзыв, ADMIN - любой" })
    remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.reviewsService.remove(id, user);
    }
}
