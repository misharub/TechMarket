ALTER TABLE "CategorySpecTemplate"
ADD COLUMN "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "options" JSONB NOT NULL DEFAULT '[]';

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

CREATE UNIQUE INDEX "CategoryCollection_slug_key" ON "CategoryCollection"("slug");
CREATE INDEX "CategoryCollection_categoryId_idx" ON "CategoryCollection"("categoryId");
CREATE INDEX "CategoryCollection_slug_idx" ON "CategoryCollection"("slug");
CREATE INDEX "CategoryCollection_sortOrder_idx" ON "CategoryCollection"("sortOrder");
CREATE INDEX "CategoryCollection_isActive_idx" ON "CategoryCollection"("isActive");

ALTER TABLE "CategoryCollection"
ADD CONSTRAINT "CategoryCollection_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
