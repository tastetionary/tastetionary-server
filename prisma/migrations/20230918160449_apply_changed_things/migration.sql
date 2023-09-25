/*
  Warnings:

  - You are about to drop the column `external_uuid` on the `restaurant_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `bookmark_ids` on the `user_preferences` table. All the data in the column will be lost.
  - You are about to drop the column `excluded_ids` on the `user_preferences` table. All the data in the column will be lost.
  - Added the required column `name` to the `external_restaurant_informations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_restaurant_information_id` to the `restaurant_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `user_areas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "restaurant_reviews_external_uuid_idx";

-- DropIndex
DROP INDEX "restaurant_reviews_external_uuid_user_id_idx";

-- DropIndex
DROP INDEX "user_preferences_bookmark_ids_idx";

-- DropIndex
DROP INDEX "user_preferences_excluded_ids_idx";

-- AlterTable
ALTER TABLE "external_restaurant_informations" ADD COLUMN     "name" VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE "restaurant_reviews" DROP COLUMN "external_uuid",
ADD COLUMN     "external_restaurant_information_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "user_areas" ADD COLUMN     "address" VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE "user_preferences" DROP COLUMN "bookmark_ids",
DROP COLUMN "excluded_ids",
ADD COLUMN     "bookmark_restaurant_ids" INTEGER[],
ADD COLUMN     "exclude_restaurant_ids" INTEGER[];

-- CreateIndex
CREATE INDEX "restaurant_reviews_external_restaurant_information_id_idx" ON "restaurant_reviews"("external_restaurant_information_id");

-- CreateIndex
CREATE INDEX "restaurant_reviews_external_restaurant_information_id_user__idx" ON "restaurant_reviews"("external_restaurant_information_id", "user_id");

-- CreateIndex
CREATE INDEX "user_preferences_bookmark_restaurant_ids_idx" ON "user_preferences" USING GIN ("bookmark_restaurant_ids");

-- CreateIndex
CREATE INDEX "user_preferences_exclude_restaurant_ids_idx" ON "user_preferences" USING GIN ("exclude_restaurant_ids");
