import { DeliveryScenario, PickupPointType } from "@prisma/client";
import { CheckoutOptionsService } from "./checkout-options.service";

describe("CheckoutOptionsService pickup points", () => {
    it("returns active pickup points matching the delivery scenario", async () => {
        const findMany = jest.fn().mockResolvedValue([{ id: "point_1" }]);
        const service = new CheckoutOptionsService({
            pickupPoint: { findMany },
        } as never);

        await service.findActivePickupPoints(DeliveryScenario.STORE_PICKUP);

        expect(findMany).toHaveBeenCalledWith({
            where: { isActive: true, type: PickupPointType.STORE },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });
    });
});

