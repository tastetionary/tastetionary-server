/*
  Warnings:

  - You are about to drop the column `price` on the `restaurant_reviews` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "restaurant_reviews_price_idx";

-- AlterTable
ALTER TABLE "restaurant_reviews" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];
