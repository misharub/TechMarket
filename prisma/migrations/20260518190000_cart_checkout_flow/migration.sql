-- CreateEnum
CREATE TYPE "DeliveryScenario" AS ENUM ('COURIER', 'STORE_PICKUP', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "PickupPointType" AS ENUM ('STORE', 'PICKUP_POINT');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "isSelected" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "DeliveryMethod" ADD COLUMN     "scenario" "DeliveryScenario" NOT NULL DEFAULT 'COURIER';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pickupPointAddress" TEXT,
ADD COLUMN     "pickupPointId" TEXT,
ADD COLUMN     "pickupPointName" TEXT;

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
