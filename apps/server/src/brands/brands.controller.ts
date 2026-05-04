import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { FindBrandsDto } from "./dto/find-brands.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@ApiTags("Brands")
@Controller("brands")
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    @ApiOperation({ summary: "Получить список брендов" })
    findAll(@Query() query: FindBrandsDto) {
        return this.brandsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Получить бренд по id" })
    findOne(@Param("id") id: string) {
        return this.brandsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать бренд, только ADMIN" })
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить бренд, только ADMIN" })
    update(@Param("id") id: string, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Скрыть бренд, только ADMIN" })
    remove(@Param("id") id: string) {
        return this.brandsService.remove(id);
    }
}
