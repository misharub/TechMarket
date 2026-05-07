import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CheckoutOptionsModule } from "../checkout-options/checkout-options.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PromoCodesModule } from "../promo-codes/promo-codes.module";
import { PrismaModule } from "../prisma/prisma.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    imports: [AuthModule, PrismaModule, PromoCodesModule, NotificationsModule, CheckoutOptionsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}
