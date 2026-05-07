import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    @ApiOperation({ summary: "Получить уведомления текущего пользователя и количество непрочитанных" })
    findAll(@CurrentUser() user: RequestUser) {
        return this.notificationsService.findAll(user.id);
    }

    @Patch("read-all")
    @ApiOperation({ summary: "Отметить все уведомления текущего пользователя прочитанными" })
    markAllAsRead(@CurrentUser() user: RequestUser) {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Patch(":id/read")
    @ApiOperation({ summary: "Отметить одно уведомление текущего пользователя прочитанным" })
    markAsRead(@CurrentUser() user: RequestUser, @Param("id") id: string) {
        return this.notificationsService.markAsRead(user.id, id);
    }
}
