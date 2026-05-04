import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";
import { CategorySpecsModule } from "./category-specs/category-specs.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";

@Module({
    imports: [
        // ConfigModule читает .env и делает настройки доступными через ConfigService.
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [join(process.cwd(), "../../.env"), join(process.cwd(), ".env")],
        }),
        // PrismaModule дает доступ к PrismaService во всех модулях приложения.
        PrismaModule,
        CategoriesModule,
        CategorySpecsModule,
        BrandsModule,
        ProductsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
