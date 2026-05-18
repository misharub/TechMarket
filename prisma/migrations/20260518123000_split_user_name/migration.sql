ALTER TABLE "User"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;

UPDATE "User"
SET
  "firstName" = CASE
    WHEN POSITION(' ' IN "name") > 0 THEN SPLIT_PART("name", ' ', 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN POSITION(' ' IN "name") > 0 THEN NULLIF(BTRIM(SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)), '')
    ELSE NULL
  END;

ALTER TABLE "User"
ALTER COLUMN "firstName" SET NOT NULL;

ALTER TABLE "User"
DROP COLUMN "name";
