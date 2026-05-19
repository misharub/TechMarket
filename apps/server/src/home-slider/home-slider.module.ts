import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { HomeSliderController } from "./home-slider.controller";
import { HomeSliderService } from "./home-slider.service";

@Module({
    imports: [PrismaModule],
    controllers: [HomeSliderController],
    providers: [HomeSliderService],
})
export class HomeSliderModule {}
