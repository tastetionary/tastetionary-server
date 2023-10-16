/*
  Warnings:

  - Added the required column `category` to the `authentication_histories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "authentication_histories_identification_type_code_idx";

-- DropIndex
DROP INDEX "authentication_histories_identification_type_idx";

-- DropIndex
DROP INDEX "authentications_user_id_category_state_idx";

-- DropIndex
DROP INDEX "authentications_user_id_identification_category_idx";

-- AlterTable
ALTER TABLE "authentication_histories" ADD COLUMN     "category" VARCHAR(32) NOT NULL;

-- CreateIndex
CREATE INDEX "authentication_histories_identification_category_type_idx" ON "authentication_histories"("identification", "category", "type");

-- CreateIndex
CREATE INDEX "authentication_histories_identification_category_type_code_idx" ON "authentication_histories"("identification", "category", "type", "code");

-- CreateIndex
CREATE INDEX "authentication_histories_user_id_identification_category_ty_idx" ON "authentication_histories"("user_id", "identification", "category", "type");

-- CreateIndex
CREATE INDEX "authentications_user_id_category_type_state_idx" ON "authentications"("user_id", "category", "type", "state");

-- CreateIndex
CREATE INDEX "authentications_user_id_identification_category_type_idx" ON "authentications"("user_id", "identification", "category", "type");

-- CreateIndex
CREATE INDEX "authentications_identification_category_type_idx" ON "authentications"("identification", "category", "type");
