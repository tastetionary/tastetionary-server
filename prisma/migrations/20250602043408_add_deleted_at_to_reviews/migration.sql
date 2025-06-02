-- AlterTable
ALTER TABLE "restaurant_reviews" ADD COLUMN     "deleted_at" TIMESTAMP DEFAULT NULL;

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];
