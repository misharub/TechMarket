import { BadRequestException } from "@nestjs/common";
import { DeliveryScenario } from "@prisma/client";
import { OrdersService } from "./orders.service";

describe("OrdersService delivery requirements", () => {
    it("requires a pickup point for non-courier delivery", async () => {
        const service = new OrdersService(
            {} as never,
            {} as never,
            {} as never,
            {
                validateDeliveryMethod: jest.fn().mockResolvedValue({ scenario: DeliveryScenario.STORE_PICKUP }),
                validatePickupPoint: jest.fn(),
            } as never,
        );

        await expect(
            service["resolveDeliveryDestination"]("user_1", {
                deliveryMethod: "pickup",
            } as never),
        ).rejects.toThrow(BadRequestException);
    });
});
