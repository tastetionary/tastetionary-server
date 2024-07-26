-- AlterTable
ALTER TABLE "restaurant_reviews" ADD COLUMN     "dislike" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "like" INTEGER NOT NULL DEFAULT 0;
