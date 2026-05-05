import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CheckoutOrderDto } from "./dto/checkout-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@ApiTags("Orders")
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post("orders")
    @ApiOperation({ summary: "Оформить заказ из корзины" })
    create(@CurrentUser() user: RequestUser, @Body() dto: CheckoutOrderDto) {
        return this.ordersService.create(user.id, dto);
    }

    @Get("orders")
    @ApiOperation({ summary: "Получить заказы текущего пользователя" })
    findUserOrders(@CurrentUser() user: RequestUser) {
        return this.ordersService.findUserOrders(user.id);
    }

    @Get("orders/:id")
    @ApiOperation({ summary: "Получить заказ текущего пользователя по id" })
    findUserOrder(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.ordersService.findUserOrder(user.id, id);
    }

    @Get("admin/orders")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Получить все заказы, только ADMIN" })
    findAllAdmin() {
        return this.ordersService.findAllAdmin();
    }

    @Get("admin/orders/:id")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Получить любой заказ по id, только ADMIN" })
    findOneAdmin(@Param("id") id: string) {
        return this.ordersService.findOneAdmin(id);
    }

    @Patch("admin/orders/:id/status")
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Изменить статус заказа, только ADMIN" })
    updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }
}
