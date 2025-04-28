-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "requiredPasswordChange" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_opinions" ALTER COLUMN "type" SET DEFAULT ARRAY[]::VARCHAR(64)[];
