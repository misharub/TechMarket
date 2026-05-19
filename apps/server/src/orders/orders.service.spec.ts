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

    it("uses manual Europost fields for pickup point delivery", async () => {
        const validatePickupPoint = jest.fn();
        const service = new OrdersService(
            {} as never,
            {} as never,
            {} as never,
            {
                validateDeliveryMethod: jest.fn(),
                validatePickupPoint,
            } as never,
        );

        await expect(
            service["resolveDeliveryDestination"](
                "user_1",
                {
                    deliveryMethod: "pickup_point",
                    recipientName: "Test Recipient",
                    pickupCity: "Minsk",
                    pickupNumber: "67",
                } as never,
                { scenario: DeliveryScenario.PICKUP_POINT },
            ),
        ).resolves.toEqual({
            city: "Minsk",
            deliveryAddress: "Отделение Европочты 67",
            pickupPointId: null,
            pickupPointName: null,
            pickupPointAddress: null,
            recipientName: "Test Recipient",
            pickupCity: "Minsk",
            pickupNumber: "67",
        });
        expect(validatePickupPoint).not.toHaveBeenCalled();
    });
});
