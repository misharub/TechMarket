import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@ApiTags("Cart")
@Controller("cart")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    @ApiOperation({ summary: "Получить корзину текущего пользователя" })
    findAll(@CurrentUser() user: RequestUser) {
        return this.cartService.findAll(user.id);
    }

    @Post()
    @ApiOperation({ summary: "Добавить товар в корзину" })
    addItem(@CurrentUser() user: RequestUser, @Body() dto: AddCartItemDto) {
        return this.cartService.addItem(user.id, dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Изменить количество товара в корзине" })
    updateItem(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateCartItemDto) {
        return this.cartService.updateItem(user.id, id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Удалить позицию из корзины" })
    removeItem(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.cartService.removeItem(user.id, id);
    }

    @Delete()
    @ApiOperation({ summary: "Очистить корзину" })
    clear(@CurrentUser() user: RequestUser) {
        return this.cartService.clear(user.id);
    }
}
