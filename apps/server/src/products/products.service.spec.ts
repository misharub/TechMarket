import { ProductsService } from "./products.service";

describe("ProductsService bulkUpdate", () => {
    it("activates every selected product", async () => {
        const updateMany = jest.fn().mockResolvedValue({ count: 2 });
        const service = new ProductsService({ product: { updateMany } } as never);

        await service.bulkUpdate({ ids: ["product_1", "product_2"], action: "activate" });

        expect(updateMany).toHaveBeenCalledWith({
            where: { id: { in: ["product_1", "product_2"] } },
            data: { isActive: true },
        });
    });
});

describe("ProductsService additionalSpecs", () => {
    it("stores free-form additional specs when creating a product", async () => {
        const create = jest.fn().mockResolvedValue({ id: "product_1" });
        const service = new ProductsService({
            category: { findUnique: jest.fn().mockResolvedValue({ id: "category_1" }) },
            brand: { findUnique: jest.fn().mockResolvedValue({ id: "brand_1" }) },
            specificationTemplate: { findUnique: jest.fn().mockResolvedValue(null) },
            product: { create },
        } as never);

        await service.create({
            title: "Phone",
            slug: "phone",
            sku: "PHONE-1",
            description: "Phone description",
            price: 10,
            categoryId: "category_1",
            brandId: "brand_1",
            specs: {},
            additionalSpecs: [{ label: "Комплектация", value: "Зарядка 67W" }],
        });

        expect(create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    additionalSpecs: [{ label: "Комплектация", value: "Зарядка 67W" }],
                }),
            }),
        );
    });

    it("rejects malformed additional specs", async () => {
        const service = new ProductsService({} as never);

        await expect(
            service.validateAdditionalSpecs([{ label: "", value: "Зарядка" }]),
        ).rejects.toThrow("Additional spec label is required");
    });
});

describe("ProductsService template specs", () => {
    it("rejects select values outside configured options", async () => {
        const service = new ProductsService({
            specificationTemplate: {
                findUnique: jest.fn().mockResolvedValue({
                    groups: [
                        {
                            specifications: [
                                {
                                    key: "matrixType",
                                    name: "Тип матрицы",
                                    type: "SELECT",
                                    isRequired: true,
                                    options: [{ value: "IPS" }, { value: "OLED" }],
                                },
                            ],
                        },
                    ],
                }),
            },
        } as never);

        await expect(service["validateSpecs"]("category_1", { matrixType: "TN" })).rejects.toThrow(
            "Spec matrixType must use one of the configured options",
        );
    });
});
