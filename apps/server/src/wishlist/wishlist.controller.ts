import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";
import { WishlistService } from "./wishlist.service";

@ApiTags("Wishlist")
@Controller("wishlist")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Get()
    @ApiOperation({ summary: "Получить избранные товары текущего пользователя" })
    findAll(@CurrentUser() user: RequestUser) {
        return this.wishlistService.findAll(user.id);
    }

    @Post()
    @ApiOperation({ summary: "Добавить товар в избранное" })
    add(@CurrentUser() user: RequestUser, @Body() dto: AddWishlistItemDto) {
        return this.wishlistService.add(user.id, dto);
    }

    @Delete(":productId")
    @ApiOperation({ summary: "Удалить товар из избранного" })
    remove(@CurrentUser() user: RequestUser, @Param("productId") productId: string) {
        return this.wishlistService.remove(user.id, productId);
    }
}
