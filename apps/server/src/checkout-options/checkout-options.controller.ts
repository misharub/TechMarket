import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CheckoutOptionsService } from "./checkout-options.service";
import { CreateDeliveryMethodDto } from "./dto/create-delivery-method.dto";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { UpdateDeliveryMethodDto } from "./dto/update-delivery-method.dto";
import { UpdatePaymentMethodDto } from "./dto/update-payment-method.dto";

@ApiTags("Checkout options")
@Controller()
export class CheckoutOptionsController {
    constructor(private readonly checkoutOptionsService: CheckoutOptionsService) {}

    @Get("delivery-methods")
    @ApiOperation({ summary: "Get active delivery methods for checkout" })
    findActiveDeliveryMethods() {
        return this.checkoutOptionsService.findActiveDeliveryMethods();
    }

    @Get("payment-methods")
    @ApiOperation({ summary: "Get active payment methods for checkout" })
    findActivePaymentMethods() {
        return this.checkoutOptionsService.findActivePaymentMethods();
    }

    @Get("admin/delivery-methods")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    findAllDeliveryMethods() {
        return this.checkoutOptionsService.findAllDeliveryMethods();
    }

    @Post("admin/delivery-methods")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    createDeliveryMethod(@Body() dto: CreateDeliveryMethodDto) {
        return this.checkoutOptionsService.createDeliveryMethod(dto);
    }

    @Patch("admin/delivery-methods/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    updateDeliveryMethod(@Param("id") id: string, @Body() dto: UpdateDeliveryMethodDto) {
        return this.checkoutOptionsService.updateDeliveryMethod(id, dto);
    }

    @Delete("admin/delivery-methods/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    removeDeliveryMethod(@Param("id") id: string) {
        return this.checkoutOptionsService.removeDeliveryMethod(id);
    }

    @Get("admin/payment-methods")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    findAllPaymentMethods() {
        return this.checkoutOptionsService.findAllPaymentMethods();
    }

    @Post("admin/payment-methods")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
        return this.checkoutOptionsService.createPaymentMethod(dto);
    }

    @Patch("admin/payment-methods/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    updatePaymentMethod(@Param("id") id: string, @Body() dto: UpdatePaymentMethodDto) {
        return this.checkoutOptionsService.updatePaymentMethod(id, dto);
    }

    @Delete("admin/payment-methods/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    removePaymentMethod(@Param("id") id: string) {
        return this.checkoutOptionsService.removePaymentMethod(id);
    }
}
