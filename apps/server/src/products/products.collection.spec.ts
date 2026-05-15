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
});
