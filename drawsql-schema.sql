-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'VK');

-- CreateEnum
CREATE TYPE "SpecValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'PROMO', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DeliveryScenario" AS ENUM ('COURIER', 'STORE_PICKUP', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "PickupPointType" AS ENUM ('STORE', 'PICKUP_POINT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationGroup" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecificationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SpecValueType" NOT NULL,
    "unit" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationOption" (
    "id" TEXT NOT NULL,
    "specificationId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecificationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryCollection" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "oldPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specs" JSONB NOT NULL,
    "additionalSpecs" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "apartment" TEXT,
    "zipCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minOrderTotal" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scenario" "DeliveryScenario" NOT NULL DEFAULT 'COURIER',
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minOrderTotal" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupPoint" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" "PickupPointType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSlider" (
    "id" TEXT NOT NULL,
    "kicker" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryText" TEXT,
    "primaryLabel" TEXT,
    "secondaryText" TEXT,
    "secondaryLabel" TEXT,
    "panelKicker" TEXT NOT NULL,
    "panelTitle" TEXT NOT NULL,
    "panelDescription" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSlider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "promoCodeId" TEXT,
    "promoCodeCode" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "deliveryMethodName" TEXT,
    "deliveryPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pickupPointId" TEXT,
    "pickupPointName" TEXT,
    "pickupPointAddress" TEXT,
    "recipientName" TEXT,
    "pickupCity" TEXT,
    "pickupNumber" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "paymentMethodName" TEXT,
    "comment" TEXT,
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "emailMockSent" BOOLEAN NOT NULL DEFAULT false,
    "emailMockPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isBlocked_idx" ON "User"("isBlocked");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- CreateIndex
CREATE INDEX "OAuthAccount_email_idx" ON "OAuthAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerUserId_key" ON "OAuthAccount"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");

-- CreateIndex
CREATE INDEX "RefreshSession_expiresAt_idx" ON "RefreshSession"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshSession_revokedAt_idx" ON "RefreshSession"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificationTemplate_categoryId_key" ON "SpecificationTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "SpecificationTemplate_categoryId_idx" ON "SpecificationTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "SpecificationGroup_templateId_idx" ON "SpecificationGroup"("templateId");

-- CreateIndex
CREATE INDEX "SpecificationGroup_sortOrder_idx" ON "SpecificationGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "Specification_groupId_idx" ON "Specification"("groupId");

-- CreateIndex
CREATE INDEX "Specification_key_idx" ON "Specification"("key");

-- CreateIndex
CREATE INDEX "Specification_sortOrder_idx" ON "Specification"("sortOrder");

-- CreateIndex
CREATE INDEX "SpecificationOption_specificationId_idx" ON "SpecificationOption"("specificationId");

-- CreateIndex
CREATE INDEX "SpecificationOption_sortOrder_idx" ON "SpecificationOption"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryCollection_slug_key" ON "CategoryCollection"("slug");

-- CreateIndex
CREATE INDEX "CategoryCollection_categoryId_idx" ON "CategoryCollection"("categoryId");

-- CreateIndex
CREATE INDEX "CategoryCollection_slug_idx" ON "CategoryCollection"("slug");

-- CreateIndex
CREATE INDEX "CategoryCollection_sortOrder_idx" ON "CategoryCollection"("sortOrder");

-- CreateIndex
CREATE INDEX "CategoryCollection_isActive_idx" ON "CategoryCollection"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_isDefault_idx" ON "Address"("isDefault");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_isActive_idx" ON "Review"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");

-- CreateIndex
CREATE INDEX "PromoCode_startsAt_idx" ON "PromoCode"("startsAt");

-- CreateIndex
CREATE INDEX "PromoCode_endsAt_idx" ON "PromoCode"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_code_key" ON "DeliveryMethod"("code");

-- CreateIndex
CREATE INDEX "DeliveryMethod_code_idx" ON "DeliveryMethod"("code");

-- CreateIndex
CREATE INDEX "DeliveryMethod_isActive_idx" ON "DeliveryMethod"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryMethod_sortOrder_idx" ON "DeliveryMethod"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PickupPoint_code_key" ON "PickupPoint"("code");

-- CreateIndex
CREATE INDEX "PickupPoint_code_idx" ON "PickupPoint"("code");

-- CreateIndex
CREATE INDEX "PickupPoint_type_idx" ON "PickupPoint"("type");

-- CreateIndex
CREATE INDEX "PickupPoint_isActive_idx" ON "PickupPoint"("isActive");

-- CreateIndex
CREATE INDEX "PickupPoint_sortOrder_idx" ON "PickupPoint"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_code_idx" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");

-- CreateIndex
CREATE INDEX "PaymentMethod_sortOrder_idx" ON "PaymentMethod"("sortOrder");

-- CreateIndex
CREATE INDEX "HomeSlider_isActive_idx" ON "HomeSlider"("isActive");

-- CreateIndex
CREATE INDEX "HomeSlider_updatedAt_idx" ON "HomeSlider"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_promoCodeId_idx" ON "Order"("promoCodeId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_toStatus_idx" ON "OrderStatusHistory"("toStatus");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationTemplate" ADD CONSTRAINT "SpecificationTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationGroup" ADD CONSTRAINT "SpecificationGroup_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SpecificationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SpecificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationOption" ADD CONSTRAINT "SpecificationOption_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCollection" ADD CONSTRAINT "CategoryCollection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
