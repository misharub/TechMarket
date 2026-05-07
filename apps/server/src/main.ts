import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap";
import { validateRuntimeEnv } from "./config/env.validation";

async function bootstrap() {
    validateRuntimeEnv();

    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT) || 5000;

    configureApp(app);

    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}/api`);
}

bootstrap();
