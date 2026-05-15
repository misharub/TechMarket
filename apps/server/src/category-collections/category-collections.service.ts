import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryCollectionDto } from "./dto/create-category-collection.dto";
import { UpdateCategoryCollectionDto } from "./dto/update-category-collection.dto";

@Injectable()
export class CategoryCollectionsService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(categoryId: string, includeInactive = false) {
        return this.prisma.categoryCollection.findMany({
            where: {
                categoryId,
                ...(includeInactive ? {} : { isActive: true }),
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    }

    async create(categoryId: string, dto: CreateCategoryCollectionDto) {
        await this.ensureCategoryExists(categoryId);

        return this.prisma.categoryCollection.create({
            data: {
                ...dto,
                categoryId,
                conditions: dto.conditions as Prisma.InputJsonValue,
            },
        });
    }

    async update(categoryId: string, collectionId: string, dto: UpdateCategoryCollectionDto) {
        await this.ensureCollectionBelongsToCategory(categoryId, collectionId);
        const { conditions, ...restDto } = dto;

        return this.prisma.categoryCollection.update({
            where: { id: collectionId },
            data: {
                ...restDto,
                ...(conditions ? { conditions: conditions as Prisma.InputJsonValue } : {}),
            },
        });
    }

    async remove(categoryId: string, collectionId: string) {
        await this.ensureCollectionBelongsToCategory(categoryId, collectionId);

        return this.prisma.categoryCollection.update({
            where: { id: collectionId },
            data: { isActive: false },
        });
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await this.prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private async ensureCollectionBelongsToCategory(categoryId: string, collectionId: string) {
        const collection = await this.prisma.categoryCollection.findFirst({
            where: { id: collectionId, categoryId },
            select: { id: true },
        });

        if (!collection) {
            throw new NotFoundException("Category collection not found");
        }
    }
}
