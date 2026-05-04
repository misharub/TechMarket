import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
    @ApiOperation({ summary: "Создать товар" })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Обновить товар" })
    update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Скрыть товар" })
    remove(@Param("id") id: string) {
        return this.productsService.remove(id);
    }
}
