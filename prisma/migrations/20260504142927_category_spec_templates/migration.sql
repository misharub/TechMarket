-- CreateEnum
CREATE TYPE "SpecValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateTable
CREATE TABLE "CategorySpecTemplate" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "SpecValueType" NOT NULL,
    "unit" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isComparable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "helpText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategorySpecTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategorySpecTemplate_categoryId_idx" ON "CategorySpecTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "CategorySpecTemplate_key_idx" ON "CategorySpecTemplate"("key");

-- CreateIndex
CREATE INDEX "CategorySpecTemplate_sortOrder_idx" ON "CategorySpecTemplate"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CategorySpecTemplate_categoryId_key_key" ON "CategorySpecTemplate"("categoryId", "key");

-- AddForeignKey
ALTER TABLE "CategorySpecTemplate" ADD CONSTRAINT "CategorySpecTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
