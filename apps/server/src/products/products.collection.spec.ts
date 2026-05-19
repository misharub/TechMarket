import { ProductsService } from "./products.service";

describe("ProductsService collection filters", () => {
    it("builds filters from public specification query values", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
            category: {
                findMany: jest.fn().mockResolvedValue([{ id: "phones", parentId: null, slug: "smartphones" }]),
            },
        } as never);

        await expect(
            (service as any).buildWhere({
                categorySlug: "smartphones",
                specFilters: "os:Android|ramGb:8|wirelessCharging:true",
            }),
        ).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["phones"] },
            AND: [
                { specs: { path: ["os"], equals: "Android" } },
                { specs: { path: ["ramGb"], equals: 8 } },
                { specs: { path: ["wirelessCharging"], equals: true } },
            ],
        });
    });

    it("supports multiple public specification values and numeric ranges", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
            category: {
                findMany: jest.fn().mockResolvedValue([{ id: "phones", parentId: null, slug: "smartphones" }]),
            },
        } as never);

        await expect(
            (service as any).buildWhere({
                categorySlug: "smartphones",
                specFilters: "os:Android,iOS|screenSize:6.1..6.29",
            }),
        ).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["phones"] },
            AND: [
                {
                    OR: [
                        { specs: { path: ["os"], equals: "Android" } },
                        { specs: { path: ["os"], equals: "iOS" } },
                    ],
                },
                { specs: { path: ["screenSize"], gte: 6.1, lte: 6.29 } },
            ],
        });
    });

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

    it("builds collection filters for not-equals and numeric comparison operators", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue({
                    categoryId: "laptops",
                    conditions: {
                        rules: [
                            { specificationId: "ram", operator: "greaterThan", value: 16 },
                            { specificationId: "storage", operator: "lessThan", value: 1024 },
                            { specificationId: "os", operator: "notEquals", optionId: "windows" },
                        ],
                    },
                    isActive: true,
                }),
            },
            specification: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: "ram",
                        key: "ramGb",
                        type: "NUMBER",
                        options: [],
                    },
                    {
                        id: "storage",
                        key: "storageGb",
                        type: "NUMBER",
                        options: [],
                    },
                    {
                        id: "os",
                        key: "os",
                        type: "SELECT",
                        options: [{ id: "windows", value: "Windows" }],
                    },
                ]),
            },
        } as never);

        await expect((service as any).buildWhere({ collectionSlug: "power-laptops" })).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["laptops"] },
            AND: [
                { specs: { path: ["ramGb"], gt: 16 } },
                { specs: { path: ["storageGb"], lt: 1024 } },
                { specs: { path: ["os"], not: "Windows" } },
            ],
        });
    });

    it("treats numeric select options as numbers for greater-than and less-than rules", async () => {
        const service = new ProductsService({
            categoryCollection: {
                findUnique: jest.fn().mockResolvedValue({
                    categoryId: "laptops",
                    conditions: {
                        rules: [
                            { specificationId: "ssd", operator: "greaterThan", optionId: "ssd-512" },
                            { specificationId: "ssd", operator: "lessThan", optionId: "ssd-1024" },
                        ],
                    },
                    isActive: true,
                }),
            },
            specification: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: "ssd",
                        key: "ssd",
                        type: "SELECT",
                        options: [
                            { id: "ssd-128", value: "128" },
                            { id: "ssd-256", value: "256" },
                            { id: "ssd-512", value: "512" },
                            { id: "ssd-1024", value: "1024" },
                        ],
                    },
                ]),
            },
        } as never);

        await expect((service as any).buildWhere({ collectionSlug: "ssd-range" })).resolves.toEqual({
            isActive: true,
            categoryId: { in: ["laptops"] },
            AND: [
                { specs: { path: ["ssd"], gt: 512 } },
                { specs: { path: ["ssd"], lt: 1024 } },
            ],
        });
    });
});
