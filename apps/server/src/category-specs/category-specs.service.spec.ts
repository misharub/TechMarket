import { BadRequestException } from "@nestjs/common";
import { CategorySpecsService } from "./category-specs.service";

describe("CategorySpecsService", () => {
    it("rejects templates for root categories", async () => {
        const service = new CategorySpecsService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "root_1", parentId: null }) },
        } as never);

        await expect(
            service.create("root_1", {
                key: "screenSize",
                label: "Диагональ экрана",
                type: "NUMBER",
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejects updates for locked templates", async () => {
        const service = new CategorySpecsService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "notebooks", parentId: "root_1" }) },
            categorySpecTemplate: {
                findFirst: jest.fn().mockResolvedValue({ id: "spec_1", isLocked: true }),
            },
        } as never);

        await expect(service.update("notebooks", "spec_1", { label: "Новый заголовок" })).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
