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

-- CreateIndex
CREATE UNIQUE INDEX "SpecificationTemplate_categoryId_key" ON "SpecificationTemplate"("categoryId");
CREATE INDEX "SpecificationTemplate_categoryId_idx" ON "SpecificationTemplate"("categoryId");
CREATE INDEX "SpecificationGroup_templateId_idx" ON "SpecificationGroup"("templateId");
CREATE INDEX "SpecificationGroup_sortOrder_idx" ON "SpecificationGroup"("sortOrder");
CREATE INDEX "Specification_groupId_idx" ON "Specification"("groupId");
CREATE INDEX "Specification_key_idx" ON "Specification"("key");
CREATE INDEX "Specification_sortOrder_idx" ON "Specification"("sortOrder");
CREATE INDEX "SpecificationOption_specificationId_idx" ON "SpecificationOption"("specificationId");
CREATE INDEX "SpecificationOption_sortOrder_idx" ON "SpecificationOption"("sortOrder");

-- AddForeignKey
ALTER TABLE "SpecificationTemplate"
ADD CONSTRAINT "SpecificationTemplate_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpecificationGroup"
ADD CONSTRAINT "SpecificationGroup_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "SpecificationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Specification"
ADD CONSTRAINT "Specification_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "SpecificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpecificationOption"
ADD CONSTRAINT "SpecificationOption_specificationId_fkey"
FOREIGN KEY ("specificationId") REFERENCES "Specification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move the previous flat category specification rows into one default group per category.
INSERT INTO "SpecificationTemplate" ("id", "name", "categoryId", "createdAt", "updatedAt")
SELECT
    CONCAT('tpl_', cst."categoryId"),
    CONCAT('Характеристики ', c."name"),
    cst."categoryId",
    MIN(cst."createdAt"),
    CURRENT_TIMESTAMP
FROM "CategorySpecTemplate" cst
JOIN "Category" c ON c."id" = cst."categoryId"
GROUP BY cst."categoryId", c."name";

INSERT INTO "SpecificationGroup" ("id", "templateId", "name", "sortOrder", "createdAt", "updatedAt")
SELECT
    CONCAT('grp_', cst."categoryId"),
    CONCAT('tpl_', cst."categoryId"),
    'Основные характеристики',
    1,
    MIN(cst."createdAt"),
    CURRENT_TIMESTAMP
FROM "CategorySpecTemplate" cst
GROUP BY cst."categoryId";

INSERT INTO "Specification" (
    "id",
    "groupId",
    "key",
    "name",
    "type",
    "unit",
    "isRequired",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
SELECT
    cst."id",
    CONCAT('grp_', cst."categoryId"),
    cst."key",
    cst."label",
    cst."type",
    cst."unit",
    cst."isRequired",
    cst."sortOrder",
    cst."createdAt",
    cst."updatedAt"
FROM "CategorySpecTemplate" cst;

INSERT INTO "SpecificationOption" (
    "id",
    "specificationId",
    "value",
    "sortOrder",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT(cst."id", '_opt_', option_rows.ordinality),
    cst."id",
    option_rows.value,
    option_rows.ordinality::INTEGER,
    cst."createdAt",
    CURRENT_TIMESTAMP
FROM "CategorySpecTemplate" cst
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(cst."options", '[]'::jsonb))
WITH ORDINALITY AS option_rows(value, ordinality)
WHERE cst."type" = 'SELECT';

-- Drop the replaced flat schema after the data has been copied.
DROP TABLE "CategorySpecTemplate";
