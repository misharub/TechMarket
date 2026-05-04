import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { BlockUserDto } from "./dto/block-user.dto";
import { FindUsersDto } from "./dto/find-users.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get("users/me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить профиль текущего пользователя" })
    getMe(@CurrentUser() user: RequestUser) {
        return this.usersService.getMe(user.id);
    }

    @Patch("users/me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить профиль текущего пользователя" })
    updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateMeDto) {
        return this.usersService.updateMe(user.id, dto);
    }

    @Get("admin/users")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить список пользователей, только ADMIN" })
    findAll(@Query() query: FindUsersDto) {
        return this.usersService.findAll(query);
    }

    @Patch("admin/users/:id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить пользователя, только ADMIN" })
    updateByAdmin(@Param("id") id: string, @Body() dto: AdminUpdateUserDto) {
        return this.usersService.updateByAdmin(id, dto);
    }

    @Patch("admin/users/:id/block")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Заблокировать или разблокировать пользователя, только ADMIN" })
    block(@Param("id") id: string, @Body() dto: BlockUserDto) {
        return this.usersService.block(id, dto);
    }
}
