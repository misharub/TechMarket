import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UpdateHomeSliderDto } from "./dto/update-home-slider.dto";
import { HomeSliderService } from "./home-slider.service";

@ApiTags("Home slider")
@Controller("home-slider")
export class HomeSliderController {
    constructor(private readonly homeSliderService: HomeSliderService) {}

    @Get()
    @ApiOperation({ summary: "Получить текст главного слайдера" })
    findPublic() {
        return this.homeSliderService.getPublicSlider();
    }

    @Get("admin")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Получить настройки главного слайдера, только ADMIN" })
    findAdmin() {
        return this.homeSliderService.getAdminSlider();
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Обновить главный слайдер, только ADMIN" })
    update(@Body() dto: UpdateHomeSliderDto) {
        return this.homeSliderService.update(dto);
    }
}
