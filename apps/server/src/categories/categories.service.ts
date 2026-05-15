import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BulkCatalogAction, BulkCatalogActionDto } from "../common/dto/bulk-catalog-action.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { FindCategoriesDto } from "./dto/find-categories.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

type CategoryWithChildren = Prisma.CategoryGetPayload<{
    include: { children: true; collections: true };
}>;

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    // Service содержит бизнес-логику: тут решаем, какие категории показывать и как работать с БД.
    findAll(query: FindCategoriesDto) {
        return this.prisma.category.findMany({
            where: this.buildWhere(query),
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { parent: true, children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return category;
    }

    async create(dto: CreateCategoryDto) {
        if (dto.parentId) {
            await this.ensureCategoryExists(dto.parentId);
        }

        try {
            return await this.prisma.category.create({
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.ensureCategoryExists(id);

        if (dto.parentId === id) {
            throw new BadRequestException("Category cannot be parent of itself");
        }

        if (dto.parentId) {
            await this.ensureCategoryExists(dto.parentId);
        }

        try {
            return await this.prisma.category.update({
                where: { id },
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.ensureCategoryExists(id);

        // Мягкое удаление не удаляет строку из базы, а скрывает категорию через isActive=false.
        return this.prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
    }

    bulkUpdate(dto: BulkCatalogActionDto) {
        return this.prisma.category.updateMany({
            where: { id: { in: dto.ids } },
            data: {
                isActive: dto.action === BulkCatalogAction.ACTIVATE,
            },
        });
    }

    async findTree(query: FindCategoriesDto) {
        const categories = await this.prisma.category.findMany({
            where: this.buildWhere({ includeInactive: query.includeInactive }),
            include: {
                children: true,
                collections: {
                    where: query.includeInactive ? {} : { isActive: true },
                    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
                },
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });

        return this.buildTree(categories, query.parentId ?? null);
    }

    private buildWhere(query: FindCategoriesDto): Prisma.CategoryWhereInput {
        return {
            ...(query.includeInactive ? {} : { isActive: true }),
            ...(query.parentId ? { parentId: query.parentId } : {}),
        };
    }

    private buildTree(categories: CategoryWithChildren[], parentId: string | null) {
        return categories
            .filter((category) => category.parentId === parentId)
            .map((category) => ({
                ...category,
                children: this.buildTree(categories, category.id),
            }));
    }

    private async ensureCategoryExists(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Category slug already exists");
        }

        throw error;
    }
}
