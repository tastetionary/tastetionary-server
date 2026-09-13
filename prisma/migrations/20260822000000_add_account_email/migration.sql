-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "email" VARCHAR(256);

-- Backfill: identification currently holds the email for every existing row
UPDATE "accounts" SET "email" = "identification" WHERE "email" IS NULL;

-- CreateIndex
CREATE INDEX "accounts_category_email_idx" ON "accounts"("category", "email");
