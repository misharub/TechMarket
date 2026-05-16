import { BadRequestException } from "@nestjs/common";
import { SpecValueType } from "@prisma/client";
import { SpecificationTemplatesService } from "./specification-templates.service";

describe("SpecificationTemplatesService", () => {
    it("rejects select specifications without options", async () => {
        const service = new SpecificationTemplatesService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "category_1" }) },
        } as never);

        await expect(
            service.create({
                name: "Характеристики ноутбука",
                categoryId: "category_1",
                groups: [
                    {
                        name: "Экран",
                        specifications: [
                            {
                                name: "Тип матрицы",
                                type: SpecValueType.SELECT,
                                options: [],
                            },
                        ],
                    },
                ],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("ignores options for non-select specifications", async () => {
        const create = jest.fn().mockResolvedValue({ id: "template_1" });
        const service = new SpecificationTemplatesService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "category_1" }) },
            specificationTemplate: { create },
        } as never);

        await service.create({
            name: "Характеристики ноутбука",
            categoryId: "category_1",
            groups: [
                {
                    name: "Экран",
                    specifications: [
                        {
                            name: "Диагональ",
                            type: SpecValueType.NUMBER,
                            options: [{ value: "лишнее" }],
                        },
                    ],
                },
            ],
        });

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    groups: {
                        create: [
                            expect.objectContaining({
                                specifications: {
                                    create: [
                                        expect.objectContaining({
                                            options: { create: [] },
                                        }),
                                    ],
                                },
                            }),
                        ],
                    },
                }),
            }),
        );
    });

    it("rejects empty select options", async () => {
        const service = new SpecificationTemplatesService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "category_1" }) },
        } as never);

        await expect(
            service.create({
                name: "Характеристики ноутбука",
                categoryId: "category_1",
                groups: [
                    {
                        name: "Экран",
                        specifications: [
                            {
                                name: "Тип матрицы",
                                type: SpecValueType.SELECT,
                                options: [{ value: " " }],
                            },
                        ],
                    },
                ],
            }),
        ).rejects.toThrow("Specification options cannot be empty");
    });
});
