import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CategoryCollectionsService } from "./category-collections.service";
import { CreateCategoryCollectionDto } from "./dto/create-category-collection.dto";
import { UpdateCategoryCollectionDto } from "./dto/update-category-collection.dto";

@ApiTags("Category collections")
@Controller("categories/:categoryId/collections")
export class CategoryCollectionsController {
    constructor(private readonly categoryCollectionsService: CategoryCollectionsService) {}

    @Get()
    findAll(@Param("categoryId") categoryId: string, @Query("includeInactive") includeInactive?: string) {
        return this.categoryCollectionsService.findAll(categoryId, includeInactive === "true");
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Создать подборку категории, только ADMIN" })
    create(@Param("categoryId") categoryId: string, @Body() dto: CreateCategoryCollectionDto) {
        return this.categoryCollectionsService.create(categoryId, dto);
    }

    @Patch(":collectionId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    update(
        @Param("categoryId") categoryId: string,
        @Param("collectionId") collectionId: string,
        @Body() dto: UpdateCategoryCollectionDto,
    ) {
        return this.categoryCollectionsService.update(categoryId, collectionId, dto);
    }

    @Delete(":collectionId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    remove(@Param("categoryId") categoryId: string, @Param("collectionId") collectionId: string) {
        return this.categoryCollectionsService.remove(categoryId, collectionId);
    }
}

@ApiTags("Category collections")
@Controller("admin/collections")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminCategoryCollectionsController {
    constructor(private readonly categoryCollectionsService: CategoryCollectionsService) {}

    @Delete(":collectionId")
    @ApiOperation({ summary: "Удалить подборку по ID, только ADMIN" })
    async remove(@Param("collectionId") collectionId: string) {
        await this.categoryCollectionsService.removeById(collectionId);

        return { success: true };
    }
}
