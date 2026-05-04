import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { FindCategoriesDto } from "./dto/find-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    // Controller отвечает только за HTTP-слой: принимает запрос и передает работу в service.
    @Get()
    @ApiOperation({ summary: "Получить список категорий" })
    findAll(@Query() query: FindCategoriesDto) {
        return this.categoriesService.findAll(query);
    }

    // Tree endpoint нужен для меню каталога: frontend получит сразу готовую иерархию.
    @Get("tree")
    @ApiOperation({ summary: "Получить дерево категорий" })
    findTree(@Query() query: FindCategoriesDto) {
        return this.categoriesService.findTree(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Получить категорию по id" })
    findOne(@Param("id") id: string) {
        return this.categoriesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: "Создать категорию" })
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Обновить категорию" })
    update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Скрыть категорию" })
    remove(@Param("id") id: string) {
        return this.categoriesService.remove(id);
    }
}
