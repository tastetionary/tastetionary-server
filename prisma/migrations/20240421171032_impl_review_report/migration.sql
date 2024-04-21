-- CreateTable
CREATE TABLE "review_reports" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "content" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_reports_user_id_idx" ON "review_reports"("user_id");

-- CreateIndex
CREATE INDEX "review_reports_review_id_idx" ON "review_reports"("review_id");

-- CreateIndex
CREATE INDEX "review_reports_category_idx" ON "review_reports"("category");

-- CreateIndex
CREATE INDEX "review_reports_user_id_review_id_idx" ON "review_reports"("user_id", "review_id");

-- CreateIndex
CREATE INDEX "review_reports_user_id_category_idx" ON "review_reports"("user_id", "category");

-- CreateIndex
CREATE INDEX "review_reports_review_id_category_idx" ON "review_reports"("review_id", "category");
