/*
  Warnings:

  - Added the required column `category` to the `authentication_histories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "authentication_histories_identification_type_idx";

-- AlterTable
ALTER TABLE "authentication_histories" ADD COLUMN     "category" VARCHAR(32) NOT NULL;

-- CreateIndex
CREATE INDEX "authentication_histories_identification_type_category_idx" ON "authentication_histories"("identification", "type", "category");
