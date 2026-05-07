import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminStatsService } from "./admin-stats.service";

@ApiTags("Admin stats")
@Controller("admin/stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminStatsController {
    constructor(private readonly adminStatsService: AdminStatsService) {}

    @Get()
    @ApiOperation({ summary: "Получить сводку для главной страницы админ-панели" })
    getDashboard() {
        return this.adminStatsService.getDashboard();
    }
}
