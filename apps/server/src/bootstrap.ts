import { BadRequestException, ValidationPipe } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import express from "express";
import { join } from "node:path";
import { LocalizedExceptionFilter } from "./common/errors/localized-exception.filter";
import { localizeValidationErrors } from "./common/errors/error-localization";
import { createRateLimitMiddleware, securityHeaders } from "./security/security.middleware";

export function configureApp(app: INestApplication) {
    // Все маршруты backend начинаются с /api, чтобы отделить REST API от будущего frontend.
    app.setGlobalPrefix("api");
    const allowedOrigins = Array.from(new Set([
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ].filter(Boolean)));

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.getHttpAdapter().getInstance().disable("x-powered-by");
    app.useGlobalFilters(new LocalizedExceptionFilter());

    app.use(securityHeaders);
    app.use(["/api/auth/login", "/api/auth/register", "/api/auth/refresh"], createRateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 30,
    }));
    // Cookie parser нужен для чтения refresh token из HTTP-only cookie.
    app.use(cookieParser());
    // Загруженные изображения отдаются как обычные статические файлы по URL /uploads/...
    app.use("/uploads", express.static(join(process.cwd(), "../../uploads")));
    // ValidationPipe проверяет DTO до попадания данных в service.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory: (errors) => new BadRequestException(localizeValidationErrors(errors)),
        }),
    );

    const config = new DocumentBuilder()
        .setTitle("TechMarket API")
        .setDescription("REST API для интернет-магазина техники TechMarket")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
}
