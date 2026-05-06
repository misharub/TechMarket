import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@ApiTags("Addresses")
@Controller("addresses")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}

    @Get()
    @ApiOperation({ summary: "Получить адреса текущего пользователя" })
    findAll(@CurrentUser() user: RequestUser) {
        return this.addressesService.findAll(user.id);
    }

    @Post()
    @ApiOperation({ summary: "Создать адрес доставки" })
    create(@CurrentUser() user: RequestUser, @Body() dto: CreateAddressDto) {
        return this.addressesService.create(user.id, dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Обновить адрес доставки" })
    update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateAddressDto) {
        return this.addressesService.update(user.id, id, dto);
    }

    @Patch(":id/default")
    @ApiOperation({ summary: "Сделать адрес основным" })
    setDefault(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.addressesService.setDefault(user.id, id);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Удалить адрес доставки" })
    remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.addressesService.remove(user.id, id);
    }
}
