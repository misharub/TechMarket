import { BadRequestException } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { UsersService } from "./users.service";

describe("UsersService admin management", () => {
    it("creates a system notification and mock email for admin messages", async () => {
        const createUserNotification = jest.fn().mockResolvedValue({ id: "notification_1" });
        const service = new UsersService(
            {
                user: {
                    findUnique: jest.fn().mockResolvedValue({
                        id: "user_1",
                        email: "user@example.com",
                        firstName: "Ivan",
                        lastName: "Ivanov",
                    }),
                },
            } as never,
            {} as never,
            { createUserNotification } as never,
        );

        await service.messageByAdmin("user_1", {
            title: "Service update",
            message: "Your account was checked.",
        });

        expect(createUserNotification).toHaveBeenCalledWith({
            userId: "user_1",
            type: NotificationType.SYSTEM,
            title: "Service update",
            message: "Your account was checked.",
            email: {
                to: "user@example.com",
                subject: "TechMarket: Service update",
                body: "Your account was checked.",
            },
        });
    });

    it("does not delete a user that already has orders", async () => {
        const userDelete = jest.fn();
        const service = new UsersService(
            {
                user: {
                    findUnique: jest.fn().mockResolvedValue({ id: "user_1" }),
                    delete: userDelete,
                },
                order: {
                    count: jest.fn().mockResolvedValue(2),
                },
            } as never,
            {} as never,
            {} as never,
        );

        await expect(service.deleteByAdmin("user_1", "admin_1")).rejects.toThrow(BadRequestException);
        expect(userDelete).not.toHaveBeenCalled();
    });
});
