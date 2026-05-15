import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SpecValueType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductsDto, ProductSort } from "./dto/find-products.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { BulkCatalogAction, BulkCatalogActionDto } from "../common/dto/bulk-catalog-action.dto";

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    // Каталог всегда возвращается постранично, чтобы не загружать тысячи товаров одним запросом.
    async findAll(query: FindProductsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 12;
        const skip = (page - 1) * limit;
        const where = await this.buildWhere(query);

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
        const ratings = await this.getRatingsForProducts(items.map((item) => item.id));

        return {
            items: items.map((item) => this.withRating(item, ratings.get(item.id))),
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

        return this.withRating(product, await this.getRatingForProduct(product.id));
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: { category: true, brand: true },
        });

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return this.withRating(product, await this.getRatingForProduct(product.id));
    }

    async create(dto: CreateProductDto) {
        await this.ensureCategoryExists(dto.categoryId);
        await this.ensureBrandExists(dto.brandId);
        await this.validateSpecs(dto.categoryId, dto.specs);
        await this.validateAdditionalSpecs(dto.additionalSpecs ?? []);

        try {
            return await this.prisma.product.create({
                data: {
                    ...dto,
                    specs: dto.specs as Prisma.InputJsonValue,
                    additionalSpecs: (dto.additionalSpecs ?? []) as unknown as Prisma.InputJsonValue,
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
        await this.validateAdditionalSpecs(dto.additionalSpecs ?? []);
        const { additionalSpecs, ...restDto } = dto;
        const updateData: Prisma.ProductUncheckedUpdateInput = {
            ...restDto,
            specs: specs as Prisma.InputJsonValue,
            ...(additionalSpecs
                ? { additionalSpecs: additionalSpecs as unknown as Prisma.InputJsonValue }
                : {}),
        };

        try {
            return await this.prisma.product.update({
                where: { id },
                data: updateData,
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

    bulkUpdate(dto: BulkCatalogActionDto) {
        return this.prisma.product.updateMany({
            where: { id: { in: dto.ids } },
            data: {
                isActive: dto.action === BulkCatalogAction.ACTIVATE,
            },
        });
    }

    private async buildWhere(query: FindProductsDto): Promise<Prisma.ProductWhereInput> {
        const collection = query.collectionSlug
            ? await this.prisma.categoryCollection.findUnique({
                  where: { slug: query.collectionSlug },
              })
            : null;
        const categoryIds = query.categoryId
            ? [query.categoryId]
            : collection
              ? [collection.categoryId]
              : query.categorySlug
                ? await this.getCategoryAndDescendantIds(query.categorySlug, query.includeInactive)
                : undefined;
        const collectionFilters = collection?.isActive ? this.buildCollectionFilters(collection.conditions) : [];

        return {
            ...(query.isActive !== undefined ? { isActive: query.isActive } : query.includeInactive ? {} : { isActive: true }),
            ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
            ...(query.brandId ? { brandId: query.brandId } : {}),
            ...(query.inStock === undefined ? {} : query.inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } }),
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
            ...(collectionFilters.length ? { AND: collectionFilters } : {}),
        };
    }

    private buildCollectionFilters(conditions: Prisma.JsonValue): Prisma.ProductWhereInput[] {
        if (!conditions || typeof conditions !== "object" || Array.isArray(conditions)) {
            return [];
        }

        const typedConditions = conditions as {
            brandSlug?: unknown;
            specs?: Record<string, unknown>;
        };
        const filters: Prisma.ProductWhereInput[] = [];

        if (typeof typedConditions.brandSlug === "string") {
            filters.push({ brand: { slug: typedConditions.brandSlug } });
        }

        for (const [key, value] of Object.entries(typedConditions.specs ?? {})) {
            filters.push({ specs: { path: [key], equals: value as Prisma.InputJsonValue } });
        }

        return filters;
    }

    private async getCategoryAndDescendantIds(slug: string, includeInactive: boolean | undefined) {
        const categories = await this.prisma.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            select: { id: true, parentId: true, slug: true },
        });
        const root = categories.find((category) => category.slug === slug);

        if (!root) {
            return [];
        }

        const ids = new Set<string>([root.id]);
        let changed = true;

        while (changed) {
            changed = false;

            for (const category of categories) {
                if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
                    ids.add(category.id);
                    changed = true;
                }
            }
        }

        return [...ids];
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

    async validateAdditionalSpecs(items: Array<{ label?: unknown; value?: unknown }>) {
        for (const item of items) {
            if (typeof item.label !== "string" || item.label.trim() === "") {
                throw new BadRequestException("Additional spec label is required");
            }

            if (typeof item.value !== "string" || item.value.trim() === "") {
                throw new BadRequestException("Additional spec value is required");
            }
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

    private async getRatingsForProducts(productIds: string[]) {
        if (!productIds.length) {
            return new Map<string, { average: number; count: number }>();
        }

        const ratings = await this.prisma.review.groupBy({
            by: ["productId"],
            where: {
                productId: { in: productIds },
                isActive: true,
            },
            _avg: { rating: true },
            _count: { rating: true },
        });

        return new Map(
            ratings.map((rating) => [
                rating.productId,
                {
                    average: this.roundRating(rating._avg.rating),
                    count: rating._count.rating,
                },
            ]),
        );
    }

    private async getRatingForProduct(productId: string) {
        const rating = await this.prisma.review.aggregate({
            where: {
                productId,
                isActive: true,
            },
            _avg: { rating: true },
            _count: { rating: true },
        });

        return {
            average: this.roundRating(rating._avg.rating),
            count: rating._count.rating,
        };
    }

    private withRating<T extends object>(product: T, rating: { average: number; count: number } | undefined) {
        return {
            ...product,
            rating: rating ?? { average: 0, count: 0 },
        };
    }

    private roundRating(value: number | null) {
        return value === null ? 0 : Number(value.toFixed(2));
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Product slug or sku already exists");
        }

        throw error;
    }
}
