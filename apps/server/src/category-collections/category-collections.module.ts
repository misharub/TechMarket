import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CategoryCollectionsController } from "./category-collections.controller";
import { CategoryCollectionsService } from "./category-collections.service";

@Module({
    imports: [PrismaModule],
    controllers: [CategoryCollectionsController],
    providers: [CategoryCollectionsService],
})
export class CategoryCollectionsModule {}
