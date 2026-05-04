import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SpecValueType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductsDto, ProductSort } from "./dto/find-products.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    // Каталог всегда возвращается постранично, чтобы не загружать тысячи товаров одним запросом.
    async findAll(query: FindProductsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const skip = (page - 1) * limit;
        const where = this.buildWhere(query);

        const [items, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                include: { category: true, brand: true },
                orderBy: this.buildOrderBy(query.sort),
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, brand: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: { category: true, brand: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return product;
    }

    async create(dto: CreateProductDto) {
        await this.ensureCategoryExists(dto.categoryId);
        await this.ensureBrandExists(dto.brandId);
        await this.validateSpecs(dto.categoryId, dto.specs);

        try {
            return await this.prisma.product.create({
                data: {
                    ...dto,
                    specs: dto.specs as Prisma.InputJsonValue,
                },
                include: { category: true, brand: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateProductDto) {
        const currentProduct = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true, categoryId: true, specs: true },
        });

        if (!currentProduct) {
            throw new NotFoundException("Product not found");
        }

        if (dto.categoryId) {
            await this.ensureCategoryExists(dto.categoryId);
        }

        if (dto.brandId) {
            await this.ensureBrandExists(dto.brandId);
        }

        const categoryId = dto.categoryId ?? currentProduct.categoryId;
        const specs = dto.specs ?? this.toRecord(currentProduct.specs);
        await this.validateSpecs(categoryId, specs);

        try {
            return await this.prisma.product.update({
                where: { id },
                data: {
                    ...dto,
                    specs: specs as Prisma.InputJsonValue,
                },
                include: { category: true, brand: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.ensureProductExists(id);

        // Товар скрывается из каталога, но остается в базе для будущей истории заказов.
        return this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }

    private buildWhere(query: FindProductsDto): Prisma.ProductWhereInput {
        return {
            ...(query.includeInactive ? {} : { isActive: true }),
            ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            ...(query.brandId ? { brandId: query.brandId } : {}),
            ...(query.inStock ? { stock: { gt: 0 } } : {}),
            ...(query.priceFrom !== undefined || query.priceTo !== undefined
                ? {
                      price: {
                          ...(query.priceFrom !== undefined ? { gte: query.priceFrom } : {}),
                          ...(query.priceTo !== undefined ? { lte: query.priceTo } : {}),
                      },
                  }
                : {}),
            ...(query.search
                ? {
                      OR: [
                          { title: { contains: query.search, mode: "insensitive" } },
                          { description: { contains: query.search, mode: "insensitive" } },
                          { sku: { contains: query.search, mode: "insensitive" } },
                          { brand: { name: { contains: query.search, mode: "insensitive" } } },
                      ],
                  }
                : {}),
        };
    }

    private buildOrderBy(sort: ProductSort | undefined): Prisma.ProductOrderByWithRelationInput[] {
        switch (sort) {
            case ProductSort.PRICE_ASC:
                return [{ price: "asc" }, { title: "asc" }];
            case ProductSort.PRICE_DESC:
                return [{ price: "desc" }, { title: "asc" }];
            case ProductSort.TITLE_ASC:
                return [{ title: "asc" }];
            case ProductSort.NEWEST:
            default:
                return [{ createdAt: "desc" }];
        }
    }

    private async validateSpecs(categoryId: string, specs: Record<string, unknown>) {
        const templates = await this.prisma.categorySpecTemplate.findMany({
            where: { categoryId },
            orderBy: { sortOrder: "asc" },
        });

        const templatesByKey = new Map(templates.map((template) => [template.key, template]));

        for (const key of Object.keys(specs)) {
            if (!templatesByKey.has(key)) {
                throw new BadRequestException(`Unknown spec key: ${key}`);
            }
        }

        for (const template of templates) {
            const value = specs[template.key];

            if (template.isRequired && (value === undefined || value === null || value === "")) {
                throw new BadRequestException(`Required spec is missing: ${template.key}`);
            }

            if (value === undefined || value === null || value === "") {
                continue;
            }

            this.validateSpecType(template.key, template.type, value);
        }
    }

    private validateSpecType(key: string, type: SpecValueType, value: unknown) {
        if (type === SpecValueType.STRING && typeof value !== "string") {
            throw new BadRequestException(`Spec ${key} must be a string`);
        }

        if (type === SpecValueType.SELECT && typeof value !== "string") {
            throw new BadRequestException(`Spec ${key} must be a string`);
        }

        if (type === SpecValueType.NUMBER && (typeof value !== "number" || !Number.isFinite(value))) {
            throw new BadRequestException(`Spec ${key} must be a number`);
        }

        if (type === SpecValueType.BOOLEAN && typeof value !== "boolean") {
            throw new BadRequestException(`Spec ${key} must be a boolean`);
        }
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

    private async ensureBrandExists(brandId: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id: brandId },
            select: { id: true },
        });

        if (!brand) {
            throw new NotFoundException("Brand not found");
        }
    }

    private async ensureProductExists(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }
    }

    private toRecord(value: Prisma.JsonValue): Record<string, unknown> {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {};
        }

        return value as Record<string, unknown>;
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Product slug or sku already exists");
        }

        throw error;
    }
}
