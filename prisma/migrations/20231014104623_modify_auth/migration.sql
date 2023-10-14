/*
  Warnings:

  - You are about to drop the column `user_id` on the `authentication_histories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "authentication_histories_user_id_identification_category_ty_idx";

-- DropIndex
DROP INDEX "authentication_histories_user_id_idx";

-- AlterTable
ALTER TABLE "authentication_histories" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "authentications" ALTER COLUMN "user_id" DROP NOT NULL;
