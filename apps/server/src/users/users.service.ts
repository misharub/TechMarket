import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { BlockUserDto } from "./dto/block-user.dto";
import { FindUsersDto } from "./dto/find-users.dto";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
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
