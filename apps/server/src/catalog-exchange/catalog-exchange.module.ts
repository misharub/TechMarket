import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CatalogExchangeController } from "./catalog-exchange.controller";
import { CatalogExchangeService } from "./catalog-exchange.service";

@Module({
    imports: [PrismaModule],
    controllers: [CatalogExchangeController],
    providers: [CatalogExchangeService],
})
export class CatalogExchangeModule {}
