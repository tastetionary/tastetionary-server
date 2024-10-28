/*
  Warnings:

  - The `type` column on the `user_opinions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "user_opinions_category_type_idx";

-- AlterTable
ALTER TABLE "user_opinions" DROP COLUMN "type",
ADD COLUMN     "type" VARCHAR(64)[] DEFAULT ARRAY[]::VARCHAR(64)[];

-- CreateIndex
CREATE INDEX "user_opinions_type_idx" ON "user_opinions"("type");
