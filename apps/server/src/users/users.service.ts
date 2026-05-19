import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminMessageUserDto } from "./dto/admin-message-user.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { BlockUserDto } from "./dto/block-user.dto";
import { FindUsersDto } from "./dto/find-users.dto";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
        private readonly notificationsService: NotificationsService,
    ) {}

    getMe(userId: string) {
        return this.findPublicUser(userId);
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
        });

        return this.authService.toPublicUser(user);
    }

    async findAll(query: FindUsersDto) {
        const users = await this.prisma.user.findMany({
            where: this.buildWhere(query),
            orderBy: { createdAt: "desc" },
        });

        return users.map((user) => this.authService.toPublicUser(user));
    }

    async updateByAdmin(id: string, dto: AdminUpdateUserDto) {
        await this.ensureUserExists(id);

        const user = await this.prisma.user.update({
            where: { id },
            data: dto,
        });

        if (dto.isBlocked) {
            await this.authService.revokeUserSessions(id);
        }

        return this.authService.toPublicUser(user);
    }

    async block(id: string, dto: BlockUserDto) {
        await this.ensureUserExists(id);

        const user = await this.prisma.user.update({
            where: { id },
            data: { isBlocked: dto.isBlocked },
        });

        if (dto.isBlocked) {
            await this.authService.revokeUserSessions(id);
        }

        return this.authService.toPublicUser(user);
    }

    async messageByAdmin(id: string, dto: AdminMessageUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return this.notificationsService.createUserNotification({
            userId: user.id,
            type: NotificationType.SYSTEM,
            title: dto.title,
            message: dto.message,
            email: {
                to: user.email,
                subject: `TechMarket: ${dto.title}`,
                body: dto.message,
            },
        });
    }

    async deleteByAdmin(id: string, adminId: string) {
        if (id === adminId) {
            throw new BadRequestException("Admin cannot delete own account");
        }

        await this.ensureUserExists(id);

        const ordersCount = await this.prisma.order.count({
            where: { userId: id },
        });

        if (ordersCount > 0) {
            throw new BadRequestException("User with orders cannot be deleted");
        }

        await this.prisma.user.delete({
            where: { id },
        });

        return { success: true };
    }

    private async findPublicUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return this.authService.toPublicUser(user);
    }

    private buildWhere(query: FindUsersDto): Prisma.UserWhereInput {
        return {
            ...(query.role ? { role: query.role } : {}),
            ...(query.isBlocked !== undefined ? { isBlocked: query.isBlocked } : {}),
            ...(query.search
                ? {
                      OR: [
                          { email: { contains: query.search, mode: "insensitive" } },
                          { firstName: { contains: query.search, mode: "insensitive" } },
                          { lastName: { contains: query.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }

    private async ensureUserExists(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }
    }
}
