import { BrandsService } from "./brands.service";

describe("BrandsService bulkUpdate", () => {
    it("deactivates every selected brand", async () => {
        const updateMany = jest.fn().mockResolvedValue({ count: 2 });
        const service = new BrandsService({ brand: { updateMany } } as never);

        await service.bulkUpdate({ ids: ["brand_1", "brand_2"], action: "deactivate" });

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["brand_1", "brand_2"] } },
            data: { isActive: false },
        });
    });
});
