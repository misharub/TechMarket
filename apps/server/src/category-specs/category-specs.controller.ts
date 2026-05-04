import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CategorySpecsService } from "./category-specs.service";
import { CreateCategorySpecDto } from "./dto/create-category-spec.dto";
import { UpdateCategorySpecDto } from "./dto/update-category-spec.dto";

@ApiTags("Category specs")
@Controller("categories/:categoryId/specs")
export class CategorySpecsController {
    constructor(private readonly categorySpecsService: CategorySpecsService) {}

    // Controller принимает HTTP-запрос и передает работу в service, где находится бизнес-логика.
    @Get()
    @ApiOperation({ summary: "Получить шаблоны характеристик категории" })
    findAll(@Param("categoryId") categoryId: string) {
        return this.categorySpecsService.findAll(categoryId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать шаблон характеристики категории, только ADMIN" })
    create(@Param("categoryId") categoryId: string, @Body() dto: CreateCategorySpecDto) {
        return this.categorySpecsService.create(categoryId, dto);
    }

    @Patch(":specId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить шаблон характеристики категории, только ADMIN" })
    update(
        @Param("categoryId") categoryId: string,
        @Param("specId") specId: string,
        @Body() dto: UpdateCategorySpecDto,
    ) {
        return this.categorySpecsService.update(categoryId, specId, dto);
    }

    @Delete(":specId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Удалить шаблон характеристики категории, только ADMIN" })
    remove(@Param("categoryId") categoryId: string, @Param("specId") specId: string) {
        return this.categorySpecsService.remove(categoryId, specId);
    }
}
