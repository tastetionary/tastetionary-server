-- CreateTable
CREATE TABLE "user_opinions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "opinion" VARCHAR(1024),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_opinions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_opinions_user_id_idx" ON "user_opinions"("user_id");

-- CreateIndex
CREATE INDEX "user_opinions_category_idx" ON "user_opinions"("category");

-- CreateIndex
CREATE INDEX "user_opinions_type_idx" ON "user_opinions"("type");

-- CreateIndex
CREATE INDEX "user_opinions_category_type_idx" ON "user_opinions"("category", "type");

-- CreateIndex
CREATE UNIQUE INDEX "user_opinions_user_id_category_key" ON "user_opinions"("user_id", "category");
