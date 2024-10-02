/*
  Warnings:

  - You are about to drop the column `dislike` on the `restaurant_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `like` on the `restaurant_reviews` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "REACTION_TYPE" AS ENUM ('L', 'D');

-- AlterTable
ALTER TABLE "restaurant_reviews" DROP COLUMN "dislike",
DROP COLUMN "like";

-- CreateTable
CREATE TABLE "restaurant_review_reactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "reaction_type" "REACTION_TYPE" NOT NULL DEFAULT 'L',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_review_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restaurant_review_reactions_user_id_idx" ON "restaurant_review_reactions"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_review_reactions_review_id_idx" ON "restaurant_review_reactions"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_review_reactions_user_id_review_id_key" ON "restaurant_review_reactions"("user_id", "review_id");

-- AddForeignKey
ALTER TABLE "restaurant_review_reactions" ADD CONSTRAINT "restaurant_review_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_review_reactions" ADD CONSTRAINT "restaurant_review_reactions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "restaurant_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
