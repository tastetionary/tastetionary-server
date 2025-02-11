-- AlterTable
ALTER TABLE "restaurant_reviews" ADD COLUMN     "prices" TEXT[];

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];
