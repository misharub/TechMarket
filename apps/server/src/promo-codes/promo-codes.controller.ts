import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { FindPromoCodesDto } from "./dto/find-promo-codes.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { ValidatePromoCodeDto } from "./dto/validate-promo-code.dto";
import { PromoCodesService } from "./promo-codes.service";

@ApiTags("Promo codes")
@Controller()
export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) {}

    @Get("admin/promo-codes")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить список промокодов, только ADMIN" })
    findAll(@Query() query: FindPromoCodesDto) {
        return this.promoCodesService.findAll(query);
    }

    @Post("admin/promo-codes")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать промокод, только ADMIN" })
    create(@Body() dto: CreatePromoCodeDto) {
        return this.promoCodesService.create(dto);
    }

    @Patch("admin/promo-codes/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить промокод, только ADMIN" })
    update(@Param("id") id: string, @Body() dto: UpdatePromoCodeDto) {
        return this.promoCodesService.update(id, dto);
    }

    @Delete("admin/promo-codes/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Отключить промокод, только ADMIN" })
    remove(@Param("id") id: string) {
        return this.promoCodesService.remove(id);
    }

    @Post("promo-codes/validate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Проверить промокод по текущей корзине пользователя" })
    validate(@CurrentUser() user: RequestUser, @Body() dto: ValidatePromoCodeDto) {
        return this.promoCodesService.validateForUserCart(user.id, dto);
    }
}
