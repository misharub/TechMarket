import { CartService } from "./cart.service";

describe("CartService selected items", () => {
    it("calculates totals only from selected items", async () => {
        const service = new CartService({
            cartItem: {
                findMany: jest.fn().mockResolvedValue([
                    { quantity: 2, isSelected: true, product: { price: 10 } },
                    { quantity: 1, isSelected: false, product: { price: 999 } },
                ]),
            },
        } as never);

        await expect(service.findAll("user_1")).resolves.toMatchObject({
            totalPrice: 20,
            selectedItemsCount: 1,
        });
    });

    it("merges guest items, clamps quantity to stock and keeps an item selected if either side selected it", async () => {
        const update = jest.fn().mockResolvedValue({
            id: "cart_1",
            productId: "product_1",
            quantity: 3,
            isSelected: true,
        });
        const service = new CartService({
            product: {
                findMany: jest.fn().mockResolvedValue([{ id: "product_1", stock: 3, isActive: true }]),
            },
            cartItem: {
                findMany: jest.fn().mockResolvedValue([{ id: "cart_1", productId: "product_1", quantity: 2, isSelected: false }]),
                update,
            },
        } as never);

        await service.mergeGuestItems("user_1", [{ productId: "product_1", quantity: 5, isSelected: true }]);

        expect(update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "cart_1" },
                data: { quantity: 3, isSelected: true },
            }),
        );
    });
});

