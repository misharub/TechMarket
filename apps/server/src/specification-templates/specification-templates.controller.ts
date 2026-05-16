import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateSpecificationTemplateDto } from "./dto/create-specification-template.dto";
import { UpdateSpecificationTemplateDto } from "./dto/update-specification-template.dto";
import { SpecificationTemplatesService } from "./specification-templates.service";

@ApiTags("Specification templates")
@Controller()
export class SpecificationTemplatesController {
    constructor(private readonly specificationTemplatesService: SpecificationTemplatesService) {}

    @Get("admin/specification-templates")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить список шаблонов характеристик, только ADMIN" })
    findAll() {
        return this.specificationTemplatesService.findAll();
    }

    @Get("admin/specification-templates/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить один шаблон характеристик, только ADMIN" })
    findOne(@Param("id") id: string) {
        return this.specificationTemplatesService.findOne(id);
    }

    @Get("specification-templates/by-category/:categoryId")
    @ApiOperation({ summary: "Получить шаблон характеристик по категории товара" })
    findByCategory(@Param("categoryId") categoryId: string) {
        return this.specificationTemplatesService.findByCategory(categoryId);
    }

    @Post("admin/specification-templates")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать шаблон характеристик, только ADMIN" })
    create(@Body() dto: CreateSpecificationTemplateDto) {
        return this.specificationTemplatesService.create(dto);
    }

    @Put("admin/specification-templates/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить шаблон характеристик, только ADMIN" })
    update(@Param("id") id: string, @Body() dto: UpdateSpecificationTemplateDto) {
        return this.specificationTemplatesService.update(id, dto);
    }

    @Delete("admin/specification-templates/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Удалить шаблон характеристик, только ADMIN" })
    remove(@Param("id") id: string) {
        return this.specificationTemplatesService.remove(id);
    }
}
