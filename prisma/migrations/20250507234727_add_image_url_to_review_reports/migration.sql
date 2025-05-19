-- AlterTable
ALTER TABLE "review_reports" ADD COLUMN     "image_url" VARCHAR(1024);

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];
