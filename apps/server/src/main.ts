import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import express from "express";
import { join } from "node:path";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT) || 5000;

    // Все маршруты backend начинаются с /api, чтобы отделить API от будущего frontend.
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
    });
    // Cookie parser нужен, чтобы refresh token можно было читать из HTTP-only cookie.
    app.use(cookieParser());
    // Загруженные изображения отдаются как обычные статические файлы по URL /uploads/...
    app.use("/uploads", express.static(join(process.cwd(), "../../uploads")));
    // ValidationPipe проверяет DTO до попадания данных в service.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Swagger строит интерактивную документацию REST API по controller и DTO.
    const config = new DocumentBuilder()
        .setTitle("TechMarket API")
        .setDescription("REST API для интернет-магазина техники TechMarket")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}/api`);
}

bootstrap();
