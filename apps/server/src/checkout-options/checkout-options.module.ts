import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CheckoutOptionsController } from "./checkout-options.controller";
import { CheckoutOptionsService } from "./checkout-options.service";

@Module({
    imports: [PrismaModule],
    controllers: [CheckoutOptionsController],
    providers: [CheckoutOptionsService],
    exports: [CheckoutOptionsService],
})
export class CheckoutOptionsModule {}
