import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать категорию, только ADMIN" })
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить категорию, только ADMIN" })
    update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Скрыть категорию, только ADMIN" })
    remove(@Param("id") id: string) {
        return this.categoriesService.remove(id);
    }
}
