import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategorySpecDto } from "./dto/create-category-spec.dto";
import { UpdateCategorySpecDto } from "./dto/update-category-spec.dto";

@Injectable()
export class CategorySpecsService {
    constructor(private readonly prisma: PrismaService) {}

    // Список шаблонов нужен frontend, чтобы построить форму характеристик для выбранной категории.
    async findAll(categoryId: string) {
        await this.ensureCategoryExists(categoryId);

        return this.prisma.categorySpecTemplate.findMany({
            where: { categoryId },
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        });
    }

    async create(categoryId: string, dto: CreateCategorySpecDto) {
        await this.ensureCategoryExists(categoryId);

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
        await this.ensureSpecBelongsToCategory(categoryId, specId);

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
        await this.ensureSpecBelongsToCategory(categoryId, specId);

        // Пока товаров нет, шаблон можно удалить физически. Позже это можно заменить мягким удалением.
        return this.prisma.categorySpecTemplate.delete({
            where: { id: specId },
        });
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private async ensureSpecBelongsToCategory(categoryId: string, specId: string) {
        const spec = await this.prisma.categorySpecTemplate.findFirst({
            where: { id: specId, categoryId },
            select: { id: true },
        });

        if (!spec) {
            throw new NotFoundException("Category spec template not found");
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Spec key already exists in this category");
        }

        throw error;
    }
}
