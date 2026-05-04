import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CategorySpecsController } from "./category-specs.controller";
import { CategorySpecsService } from "./category-specs.service";

@Module({
    imports: [PrismaModule],
    controllers: [CategorySpecsController],
    providers: [CategorySpecsService],
})
export class CategorySpecsModule {}
