/*
  Warnings:

  - A unique constraint covering the columns `[category,identification]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identification,category]` on the table `authentications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_uuid]` on the table `external_restaurant_informations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accounts_category_identification_key" ON "accounts"("category", "identification");

-- CreateIndex
CREATE UNIQUE INDEX "authentications_identification_category_key" ON "authentications"("identification", "category");

-- CreateIndex
CREATE UNIQUE INDEX "external_restaurant_informations_external_uuid_key" ON "external_restaurant_informations"("external_uuid");
