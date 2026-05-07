import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AddressesModule } from "./addresses/addresses.module";
import { AdminStatsModule } from "./admin-stats/admin-stats.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BrandsModule } from "./brands/brands.module";
import { CatalogExchangeModule } from "./catalog-exchange/catalog-exchange.module";
import { CartModule } from "./cart/cart.module";
import { CategoriesModule } from "./categories/categories.module";
import { CategorySpecsModule } from "./category-specs/category-specs.module";
import { CheckoutOptionsModule } from "./checkout-options/checkout-options.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { OrdersModule } from "./orders/orders.module";
import { ProductCompareModule } from "./product-compare/product-compare.module";
import { PromoCodesModule } from "./promo-codes/promo-codes.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UploadsModule } from "./uploads/uploads.module";
import { UsersModule } from "./users/users.module";
import { WishlistModule } from "./wishlist/wishlist.module";

@Module({
    imports: [
        // ConfigModule читает .env и делает настройки доступными через ConfigService.
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [join(process.cwd(), "../../.env"), join(process.cwd(), ".env")],
        }),
        // PrismaModule дает доступ к PrismaService во всех модулях приложения.
        PrismaModule,
        AddressesModule,
        AdminStatsModule,
        CatalogExchangeModule,
        AuthModule,
        UsersModule,
        CartModule,
        CheckoutOptionsModule,
        OrdersModule,
        NotificationsModule,
        CategoriesModule,
        CategorySpecsModule,
        BrandsModule,
        PromoCodesModule,
        ProductsModule,
        ReviewsModule,
        UploadsModule,
        WishlistModule,
        ProductCompareModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
