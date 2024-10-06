/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `user_preferences` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_preferences" ALTER COLUMN "bookmark_restaurant_ids" SET DEFAULT ARRAY[]::INTEGER[],
ALTER COLUMN "exclude_restaurant_ids" SET DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");
