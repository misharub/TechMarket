import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, SpecValueType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type ProductImportRow = {
    title: string;
    slug: string;
    sku: string;
    description: string;
    price: string;
    oldPrice?: string;
    stock?: string;
    categorySlug: string;
    brandSlug: string;
    images?: string;
    specsJson: string;
    isActive?: string;
};

@Injectable()
export class CatalogExchangeService {
    constructor(private readonly prisma: PrismaService) {}

    async exportProductsCsv() {
        const products = await this.prisma.product.findMany({
            include: { category: true, brand: true },
            orderBy: { createdAt: "desc" },
        });

        return toCsv(
            [
                "title",
                "slug",
                "sku",
                "description",
                "price",
                "oldPrice",
                "stock",
                "categorySlug",
                "brandSlug",
                "images",
                "specsJson",
                "isActive",
            ],
            products.map((product) => ({
                title: product.title,
                slug: product.slug,
                sku: product.sku,
                description: product.description,
                price: product.price,
                oldPrice: product.oldPrice ?? "",
                stock: product.stock,
                categorySlug: product.category.slug,
                brandSlug: product.brand.slug,
                images: product.images.join("|"),
                specsJson: JSON.stringify(product.specs),
                isActive: product.isActive,
            })),
        );
    }

    async exportOrdersCsv() {
        const orders = await this.prisma.order.findMany({
            include: {
                user: true,
                items: { include: { product: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return toCsv(
            [
                "id",
                "userEmail",
                "status",
                "totalPrice",
                "discountAmount",
                "deliveryPrice",
                "promoCodeCode",
                "deliveryMethod",
                "paymentMethod",
                "customerName",
                "customerPhone",
                "customerEmail",
                "city",
                "deliveryAddress",
                "items",
                "createdAt",
            ],
            orders.map((order) => ({
                id: order.id,
                userEmail: order.user.email,
                status: order.status,
                totalPrice: order.totalPrice,
                discountAmount: order.discountAmount,
                deliveryPrice: order.deliveryPrice,
                promoCodeCode: order.promoCodeCode ?? "",
                deliveryMethod: order.deliveryMethod,
                paymentMethod: order.paymentMethod,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                customerEmail: order.customerEmail,
                city: order.city,
                deliveryAddress: order.deliveryAddress,
                items: order.items.map((item) => `${item.product.sku} x ${item.quantity}`).join("; "),
                createdAt: order.createdAt.toISOString(),
            })),
        );
    }

    async importProductsCsv(csv: string) {
        const rows = parseCsv(csv) as ProductImportRow[];

        if (!rows.length) {
            throw new BadRequestException("CSV file is empty");
        }

        let created = 0;
        let updated = 0;
        const errors: Array<{ row: number; sku?: string; message: string }> = [];

        for (const [index, row] of rows.entries()) {
            try {
                const result = await this.upsertImportedProduct(row);

                if (result.created) {
                    created += 1;
                } else {
                    updated += 1;
                }
            } catch (error) {
                errors.push({
                    row: index + 2,
                    sku: row.sku,
                    message: error instanceof Error ? error.message : "Unknown import error",
                });
            }
        }

        return {
            processed: rows.length,
            created,
            updated,
            errors,
        };
    }

    private async upsertImportedProduct(row: ProductImportRow) {
        const requiredFields: Array<keyof ProductImportRow> = [
            "title",
            "slug",
            "sku",
            "description",
            "price",
            "categorySlug",
            "brandSlug",
            "specsJson",
        ];

        for (const field of requiredFields) {
            if (!row[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        const [category, brand] = await Promise.all([
            this.prisma.category.findUnique({ where: { slug: row.categorySlug } }),
            this.prisma.brand.findUnique({ where: { slug: row.brandSlug } }),
        ]);

        if (!category) {
            throw new Error(`Category not found by slug: ${row.categorySlug}`);
        }

        if (!brand) {
            throw new Error(`Brand not found by slug: ${row.brandSlug}`);
        }

        const specs = parseSpecsJson(row.specsJson);
        await this.validateSpecs(category.id, specs);

        const existingProduct = await this.prisma.product.findUnique({
            where: { sku: row.sku },
            select: { id: true },
        });
        const data = {
            title: row.title,
            slug: row.slug,
            sku: row.sku,
            description: row.description,
            price: parsePositiveNumber(row.price, "price"),
            oldPrice: row.oldPrice ? parsePositiveNumber(row.oldPrice, "oldPrice") : null,
            stock: row.stock ? parseNonNegativeInteger(row.stock, "stock") : 0,
            images: row.images ? row.images.split("|").map((image) => image.trim()).filter(Boolean) : [],
            specs: specs as Prisma.InputJsonValue,
            isActive: row.isActive === undefined || row.isActive === "" ? true : parseBoolean(row.isActive),
            categoryId: category.id,
            brandId: brand.id,
        };

        if (existingProduct) {
            await this.prisma.product.update({
                where: { id: existingProduct.id },
                data,
            });

            return { created: false };
        }

        await this.prisma.product.create({ data });

        return { created: true };
    }

    private async validateSpecs(categoryId: string, specs: Record<string, unknown>) {
        const template = await this.prisma.specificationTemplate.findUnique({
            where: { categoryId },
            include: {
                groups: {
                    include: {
                        specifications: {
                            include: { options: true },
                        },
                    },
                },
            },
        });
        const templates = template?.groups.flatMap((group) => group.specifications) ?? [];
        const templatesByKey = new Map(templates.map((template) => [template.key, template]));

        for (const key of Object.keys(specs)) {
            if (!templatesByKey.has(key)) {
                throw new Error(`Unknown spec key: ${key}`);
            }
        }

        for (const template of templates) {
            const value = specs[template.key];

            if (template.isRequired && (value === undefined || value === null || value === "")) {
                throw new Error(`Required spec is missing: ${template.key}`);
            }

            if (value === undefined || value === null || value === "") {
                continue;
            }

            if (template.type === SpecValueType.NUMBER && (typeof value !== "number" || !Number.isFinite(value))) {
                throw new Error(`Spec ${template.key} must be a number`);
            }

            if (template.type === SpecValueType.BOOLEAN && typeof value !== "boolean") {
                throw new Error(`Spec ${template.key} must be a boolean`);
            }

            const isNumericSelect =
                template.type === SpecValueType.SELECT &&
                template.options.length > 0 &&
                template.options.every((option) => option.value.trim() !== "" && Number.isFinite(Number(option.value)));

            if (
                (template.type === SpecValueType.STRING || (template.type === SpecValueType.SELECT && !isNumericSelect)) &&
                typeof value !== "string"
            ) {
                throw new Error(`Spec ${template.key} must be a string`);
            }

            if (template.type === SpecValueType.SELECT && isNumericSelect && typeof value !== "number") {
                throw new Error(`Spec ${template.key} must be a number`);
            }

            if (
                template.type === SpecValueType.SELECT &&
                !template.options.some((option) => option.value === String(value))
            ) {
                throw new Error(`Spec ${template.key} must use one of the configured options`);
            }
        }
    }
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>) {
    return [
        headers.join(","),
        ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
    ].join("\r\n");
}

function escapeCsv(value: unknown) {
    const text = value === null || value === undefined ? "" : String(value);

    if (/[",\r\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

function parseCsv(csv: string) {
    const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    const [headerLine, ...dataLines] = lines;

    if (!headerLine) {
        return [];
    }

    const headers = parseCsvLine(headerLine);

    return dataLines.map((line) => {
        const values = parseCsvLine(line);

        return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
}

function parseCsvLine(line: string) {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            current += '"';
            index += 1;
            continue;
        }

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "," && !insideQuotes) {
            values.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    values.push(current);

    return values;
}

function parseSpecsJson(value: string) {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("specsJson must be a JSON object");
    }

    return parsed as Record<string, unknown>;
}

function parsePositiveNumber(value: string, field: string) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        throw new Error(`${field} must be a positive number`);
    }

    return number;
}

function parseNonNegativeInteger(value: string, field: string) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${field} must be a non-negative integer`);
    }

    return number;
}

function parseBoolean(value: string) {
    if (value === "true" || value === "1") {
        return true;
    }

    if (value === "false" || value === "0") {
        return false;
    }

    throw new Error("isActive must be true or false");
}
