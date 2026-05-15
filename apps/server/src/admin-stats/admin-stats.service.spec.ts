import { AdminStatsService } from "./admin-stats.service";

describe("AdminStatsService getCatalogStats", () => {
    it("returns compact catalog counters", async () => {
        const service = new AdminStatsService({
            $transaction: jest.fn().mockResolvedValue([3, 7, 2]),
            category: { count: jest.fn() },
            product: { count: jest.fn() },
            brand: { count: jest.fn() },
        } as never);

        await expect(service.getCatalogStats()).resolves.toEqual({
            categoriesCount: 3,
            productsCount: 7,
            brandsCount: 2,
        });
    });
});
