import { ProductsService } from "./products.service";

describe("ProductsService collection filters", () => {
    it("builds spec and brand filters from a collection", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue({
                    categoryId: "notebooks",
                    conditions: { brandSlug: "apple", specs: { os: "macOS" } },
                    isActive: true,
                }),
            },
            specification: {
                findMany: jest.fn().mockResolvedValue([]),
            },
        } as never);

        await expect((service as any).buildWhere({ collectionSlug: "apple-macbook" })).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["notebooks"] },
            AND: [
                { brand: { slug: "apple" } },
                { specs: { path: ["os"], equals: "macOS" } },
            ],
        });
    });

    it("builds collection filters from typed specification rules", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue({
                    categoryId: "phones",
                    conditions: {
                        rules: [
                            { specificationId: "matrix", operator: "equals", optionId: "amoled" },
                            { specificationId: "ram", operator: "equals", value: 16 },
                        ],
                    },
                    isActive: true,
                }),
            },
            specification: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: "matrix",
                        key: "matrixType",
                        type: "SELECT",
                        options: [{ id: "amoled", value: "AMOLED" }],
                    },
                    {
                        id: "ram",
                        key: "ramGb",
                        type: "NUMBER",
                        options: [],
                    },
                ]),
            },
        } as never);

        await expect((service as any).buildWhere({ collectionSlug: "amoled-phones" })).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["phones"] },
            AND: [
                { specs: { path: ["matrixType"], equals: "AMOLED" } },
                { specs: { path: ["ramGb"], equals: 16 } },
            ],
        });
    });
});
