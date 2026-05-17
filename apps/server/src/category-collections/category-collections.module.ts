import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminCategoryCollectionsController, CategoryCollectionsController } from "./category-collections.controller";
import { CategoryCollectionsService } from "./category-collections.service";

@Module({
    imports: [PrismaModule],
    controllers: [CategoryCollectionsController, AdminCategoryCollectionsController],
    providers: [CategoryCollectionsService],
})
export class CategoryCollectionsModule {}
