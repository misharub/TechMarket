import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { MergeCartDto } from "./dto/merge-cart.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { UpdateCartSelectionDto } from "./dto/update-cart-selection.dto";

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

    @Post("merge")
    @ApiOperation({ summary: "Объединить гостевую корзину с корзиной пользователя" })
    merge(@CurrentUser() user: RequestUser, @Body() dto: MergeCartDto) {
        return this.cartService.mergeGuestItems(user.id, dto.items);
    }

    @Patch("selection")
    @ApiOperation({ summary: "Изменить выбор нескольких позиций корзины" })
    updateSelection(@CurrentUser() user: RequestUser, @Body() dto: UpdateCartSelectionDto) {
        return this.cartService.updateSelection(user.id, dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Изменить количество товара в корзине" })
    updateItem(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateCartItemDto) {
        return this.cartService.updateItem(user.id, id, dto);
    }

    @Delete("selected")
    @ApiOperation({ summary: "Удалить выбранные позиции из корзины" })
    removeSelected(@CurrentUser() user: RequestUser) {
        return this.cartService.removeSelected(user.id);
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
