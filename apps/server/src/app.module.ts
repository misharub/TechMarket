import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CategoriesModule } from "./categories/categories.module";
import { PrismaModule } from "./prisma/prisma.module";

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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}







