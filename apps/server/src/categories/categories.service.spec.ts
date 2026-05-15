import { CategoriesService } from "./categories.service";

describe("CategoriesService bulkUpdate", () => {
    it("deactivates every selected category for delete action", async () => {
        const updateMany = jest.fn().mockResolvedValue({ count: 2 });
        const service = new CategoriesService({ category: { updateMany } } as never);

        await service.bulkUpdate({ ids: ["cat_1", "cat_2"], action: "delete" });

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["cat_1", "cat_2"] } },
            data: { isActive: false },
        });
    });
});
