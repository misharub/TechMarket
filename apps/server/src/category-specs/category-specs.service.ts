import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategorySpecDto } from "./dto/create-category-spec.dto";
import { UpdateCategorySpecDto } from "./dto/update-category-spec.dto";

@Injectable()
export class CategorySpecsService {
    constructor(private readonly prisma: PrismaService) {}

    // Список шаблонов нужен frontend, чтобы построить форму характеристик для выбранной категории.
    async findAll(categoryId: string) {
        await this.ensureCategoryIsSection(categoryId);

        return this.prisma.categorySpecTemplate.findMany({
            where: { categoryId },
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        });
    }

    async create(categoryId: string, dto: CreateCategorySpecDto) {
        await this.ensureCategoryIsSection(categoryId);

        try {
            return await this.prisma.categorySpecTemplate.create({
                data: {
                    ...dto,
                    categoryId,
                },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(categoryId: string, specId: string, dto: UpdateCategorySpecDto) {
        await this.ensureCategoryIsSection(categoryId);
        await this.ensureSpecCanChange(categoryId, specId);

        try {
            return await this.prisma.categorySpecTemplate.update({
                where: { id: specId },
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(categoryId: string, specId: string) {
        await this.ensureCategoryIsSection(categoryId);
        await this.ensureSpecCanChange(categoryId, specId);

        // Пока товаров нет, шаблон можно удалить физически. Позже это можно заменить мягким удалением.
        return this.prisma.categorySpecTemplate.delete({
            where: { id: specId },
        });
    }

    private async ensureCategoryIsSection(categoryId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, parentId: true },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        if (!category.parentId) {
            throw new BadRequestException("Category specs are available only for sections");
        }
    }

    private async ensureSpecCanChange(categoryId: string, specId: string) {
        const spec = await this.prisma.categorySpecTemplate.findFirst({
            where: { id: specId, categoryId },
            select: { id: true, isLocked: true },
        });

        if (!spec) {
            throw new NotFoundException("Category spec template not found");
        }

        if (spec.isLocked) {
            throw new BadRequestException("Locked category specs cannot be changed");
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Spec key already exists in this category");
        }

        throw error;
    }
}
