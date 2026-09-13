-- AlterTable
ALTER TABLE "external_restaurant_informations" ADD COLUMN     "category" VARCHAR(32),
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "source" VARCHAR(16) NOT NULL DEFAULT 'KAKAO',
ADD COLUMN     "source_category_code" VARCHAR(8),
ADD COLUMN     "source_id" VARCHAR(32),
ADD COLUMN     "synced_at" TIMESTAMP(3),
ALTER COLUMN "external_uuid" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "external_restaurant_informations_source_source_id_key" ON "external_restaurant_informations"("source", "source_id");

SELECT setval(
  pg_get_serial_sequence('external_restaurant_informations', 'id'),
  GREATEST(
    (SELECT COALESCE(MAX("id"), 1) FROM "external_restaurant_informations"),
    (SELECT "last_value" FROM "external_restaurant_informations_id_seq")
  )
);

