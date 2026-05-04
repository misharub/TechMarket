import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
    @ApiOperation({ summary: "Создать шаблон характеристики категории" })
    create(@Param("categoryId") categoryId: string, @Body() dto: CreateCategorySpecDto) {
        return this.categorySpecsService.create(categoryId, dto);
    }

    @Patch(":specId")
    @ApiOperation({ summary: "Обновить шаблон характеристики категории" })
    update(
        @Param("categoryId") categoryId: string,
        @Param("specId") specId: string,
        @Body() dto: UpdateCategorySpecDto,
    ) {
        return this.categorySpecsService.update(categoryId, specId, dto);
    }

    @Delete(":specId")
    @ApiOperation({ summary: "Удалить шаблон характеристики категории" })
    remove(@Param("categoryId") categoryId: string, @Param("specId") specId: string) {
        return this.categorySpecsService.remove(categoryId, specId);
    }
}
