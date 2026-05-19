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

CREATE INDEX "HomeSlider_isActive_idx" ON "HomeSlider"("isActive");
CREATE INDEX "HomeSlider_updatedAt_idx" ON "HomeSlider"("updatedAt");
