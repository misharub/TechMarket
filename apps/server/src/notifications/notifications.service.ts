import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type MockEmailPayload = {
    to: string;
    subject: string;
    body: string;
};

type CreateUserNotificationInput = {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    email?: MockEmailPayload;
};

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly prisma: PrismaService) {}

    // Этот метод нужен frontend-значку уведомлений: items идут в выпадающий список, unreadCount - в бейдж.
    async findAll(userId: string) {
        const [items, unreadCount] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);

        return { items, unreadCount };
    }

    async markAsRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
            select: { id: true },
        });

        if (!notification) {
            throw new NotFoundException("Notification not found");
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async markAllAsRead(userId: string) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return { updated: result.count };
    }

    // Внутренний метод используют другие модули. Он создает уведомление и сохраняет mock email без реальной SMTP-отправки.
    async createUserNotification(input: CreateUserNotificationInput) {
        const emailMockPayload = input.email ? this.buildEmailPayload(input.email) : undefined;

        if (emailMockPayload) {
            this.logger.log(`Mock email created: ${JSON.stringify(emailMockPayload)}`);
        }

        return this.prisma.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title: input.title,
                message: input.message,
                emailMockSent: Boolean(emailMockPayload),
                emailMockPayload: emailMockPayload as Prisma.InputJsonValue | undefined,
            },
        });
    }

    private buildEmailPayload(email: MockEmailPayload) {
        return {
            ...email,
            mock: true,
            createdAt: new Date().toISOString(),
        };
    }
}
