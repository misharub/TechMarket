import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { BulkCatalogActionDto } from "../common/dto/bulk-catalog-action.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductsDto } from "./dto/find-products.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    @ApiOperation({ summary: "Получить каталог товаров с фильтрами и пагинацией" })
    findAll(@Query() query: FindProductsDto) {
        return this.productsService.findAll(query);
    }

    @Get("by-slug/:slug")
    @ApiOperation({ summary: "Получить товар по slug" })
    findBySlug(@Param("slug") slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Get(":id")
    @ApiOperation({ summary: "Получить товар по id" })
    findOne(@Param("id") id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать товар, только ADMIN" })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Patch("bulk")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Массово обновить товары, только ADMIN" })
    bulkUpdate(@Body() dto: BulkCatalogActionDto) {
        return this.productsService.bulkUpdate(dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить товар, только ADMIN" })
    update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Скрыть товар, только ADMIN" })
    remove(@Param("id") id: string) {
        return this.productsService.remove(id);
    }
}
