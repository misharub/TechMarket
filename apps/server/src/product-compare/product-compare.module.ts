import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProductCompareController } from "./product-compare.controller";
import { ProductCompareService } from "./product-compare.service";

@Module({
    imports: [PrismaModule, AiModule],
    controllers: [ProductCompareController],
    providers: [ProductCompareService],
})
export class ProductCompareModule {}
