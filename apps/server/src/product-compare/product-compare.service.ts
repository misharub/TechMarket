import { BadRequestException, Injectable } from "@nestjs/common";
import { SpecValueType } from "@prisma/client";
import type { Product, Specification } from "@prisma/client";
import { AiService } from "../ai/ai.service";
import { PrismaService } from "../prisma/prisma.service";
import { CompareProductsDto } from "./dto/compare-products.dto";

type ProductWithRelations = Product & {
    brand: { id: string; name: string; slug: string };
    category: { id: string; name: string; slug: string };
};

type CompareRow = {
    key: string;
    label: string;
    unit: string | null;
    type: SpecValueType;
    values: Record<string, unknown>;
    bestProductIds: string[];
};

@Injectable()
export class ProductCompareService {
    private readonly smallerIsBetterKeys = new Set(["weight", "powerConsumption", "noiseLevel"]);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) {}

    // Сравнение stateless: сервер ничего не сохраняет, а каждый раз строит таблицу по переданным productIds.
    async compare(dto: CompareProductsDto) {
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: dto.productIds },
                isActive: true,
            },
            include: {
                brand: true,
                category: true,
            },
        });

        if (products.length !== dto.productIds.length) {
            throw new BadRequestException("All products must exist and be active");
        }

        const orderedProducts = this.orderProductsByRequest(dto.productIds, products);
        const categoryId = orderedProducts[0].categoryId;

        if (orderedProducts.some((product) => product.categoryId !== categoryId)) {
            throw new BadRequestException("Products must belong to the same category");
        }

        const template = await this.prisma.specificationTemplate.findUnique({
            where: { categoryId },
            include: {
                groups: {
                    include: {
                        specifications: true,
                    },
                },
            },
        });
        const templates = (template?.groups ?? [])
            .flatMap((group) => group.specifications)
            .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

        const rows = templates.map((template) => this.buildRow(template, orderedProducts));
        const fallbackSummary = this.buildDemoAiSummary(orderedProducts, rows);
        const aiSummary = await this.aiService.generateProductComparisonSummary({
            categoryName: orderedProducts[0].category.name,
            products: orderedProducts.map((product) => ({
                id: product.id,
                title: product.title,
                brand: product.brand.name,
                price: Number(product.price),
                stock: product.stock,
            })),
            rows,
            fallbackSummary,
        });

        return {
            category: {
                id: orderedProducts[0].category.id,
                name: orderedProducts[0].category.name,
            },
            products: orderedProducts.map((product) => this.toProductSummary(product)),
            rows,
            aiSummary: aiSummary.text,
            aiSummaryMeta: {
                provider: aiSummary.provider,
                isFallback: aiSummary.isFallback,
                fallbackReason: aiSummary.isFallback ? aiSummary.fallbackReason : undefined,
            },
        };
    }

    private orderProductsByRequest(ids: string[], products: ProductWithRelations[]) {
        const productsById = new Map(products.map((product) => [product.id, product]));

        return ids.map((id) => {
            const product = productsById.get(id);

            if (!product) {
                throw new BadRequestException("All products must exist and be active");
            }

            return product;
        });
    }

    private buildRow(template: Specification, products: ProductWithRelations[]): CompareRow {
        const values = Object.fromEntries(
            products.map((product) => [product.id, this.toSpecsRecord(product.specs)[template.key] ?? null]),
        );

        return {
            key: template.key,
            label: template.name,
            unit: template.unit,
            type: template.type,
            values,
            bestProductIds: this.findBestProductIds(template, values),
        };
    }

    private findBestProductIds(template: Specification, values: Record<string, unknown>) {
        if (template.type === SpecValueType.BOOLEAN) {
            const trueIds = Object.entries(values)
                .filter(([, value]) => value === true)
                .map(([productId]) => productId);

            return trueIds.length > 0 ? trueIds : [];
        }

        if (template.type !== SpecValueType.NUMBER) {
            return [];
        }

        const numericValues = Object.entries(values)
            .map(([productId, value]) => ({ productId, value: this.toFiniteNumber(value) }))
            .filter((item): item is { productId: string; value: number } => item.value !== null);

        if (numericValues.length === 0) {
            return [];
        }

        const bestValue = this.smallerIsBetterKeys.has(template.key)
            ? Math.min(...numericValues.map((item) => item.value))
            : Math.max(...numericValues.map((item) => item.value));

        return numericValues.filter((item) => item.value === bestValue).map((item) => item.productId);
    }

    private buildDemoAiSummary(products: ProductWithRelations[], rows: CompareRow[]) {
        const winCounts = new Map(products.map((product) => [product.id, 0]));

        for (const row of rows) {
            for (const productId of row.bestProductIds) {
                winCounts.set(productId, (winCounts.get(productId) ?? 0) + 1);
            }
        }

        const cheapest = [...products].sort((a, b) => Number(a.price) - Number(b.price))[0];
        const mostAvailable = [...products].sort((a, b) => b.stock - a.stock)[0];
        const balanced = [...products].sort((a, b) => {
            const winsDiff = (winCounts.get(b.id) ?? 0) - (winCounts.get(a.id) ?? 0);

            return winsDiff || Number(a.price) - Number(b.price);
        })[0];

        const strengths = products
            .map((product) => {
                const bestLabels = rows
                    .filter((row) => row.bestProductIds.includes(product.id))
                    .map((row) => row.label)
                    .slice(0, 3);

                if (bestLabels.length === 0) {
                    return `${product.title}: сильные стороны по сравнимым характеристикам не выделились.`;
                }

                return `${product.title}: выделяется по параметрам ${bestLabels.join(", ")}.`;
            })
            .join(" ");

        return [
            "Demo AI-анализ сформирован сервером по правилам, без внешнего платного API.",
            `Самым сбалансированным вариантом выглядит ${balanced.title}: у него ${winCounts.get(balanced.id) ?? 0} лучших параметров в таблице.`,
            `Самый доступный по цене товар - ${cheapest.title}.`,
            `По наличию на складе сильнее выглядит ${mostAvailable.title}.`,
            strengths,
        ].join(" ");
    }

    private toProductSummary(product: ProductWithRelations) {
        return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            sku: product.sku,
            price: Number(product.price),
            oldPrice: product.oldPrice === null ? null : Number(product.oldPrice),
            stock: product.stock,
            images: product.images,
            brand: {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
            },
        };
    }

    private toSpecsRecord(value: unknown): Record<string, unknown> {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {};
        }

        return value as Record<string, unknown>;
    }

    private toFiniteNumber(value: unknown) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return null;
        }

        return value;
    }
}
