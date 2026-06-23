/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "restaurant_reviews" ALTER COLUMN "deleted_at" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";
