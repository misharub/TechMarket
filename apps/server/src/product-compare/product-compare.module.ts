import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ProductCompareController } from "./product-compare.controller";
import { ProductCompareService } from "./product-compare.service";

@Module({
    imports: [PrismaModule],
    controllers: [ProductCompareController],
    providers: [ProductCompareService],
})
export class ProductCompareModule {}
