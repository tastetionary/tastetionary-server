-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "state" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" VARCHAR(512) NOT NULL,
    "refresh_token" VARCHAR(512) NOT NULL,
    "access_token_expired_at" TIMESTAMP(3) NOT NULL,
    "refresh_token_expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_areas" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "order" SMALLINT NOT NULL,
    "location" geography NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bookmark_ids" INTEGER[],
    "excluded_ids" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_reviews" (
    "id" SERIAL NOT NULL,
    "external_uuid" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "summary" VARCHAR(128) NOT NULL,
    "opinion" VARCHAR(16) NOT NULL,
    "keywords" JSON NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "identification" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "state" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "identification" VARCHAR(256) NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "state" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_histories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "identification" VARCHAR(256) NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentication_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_nickname_idx" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "users_state_idx" ON "users"("state");

-- CreateIndex
CREATE INDEX "users_nickname_state_idx" ON "users"("nickname", "state");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_access_token_idx" ON "user_tokens"("user_id", "access_token");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_refresh_token_idx" ON "user_tokens"("user_id", "refresh_token");

-- CreateIndex
CREATE INDEX "user_areas_user_id_idx" ON "user_areas"("user_id");

-- CreateIndex
CREATE INDEX "user_areas_location_idx" ON "user_areas" USING GIST ("location");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_bookmark_ids_idx" ON "user_preferences" USING GIN ("bookmark_ids");

-- CreateIndex
CREATE INDEX "user_preferences_excluded_ids_idx" ON "user_preferences" USING GIN ("excluded_ids");

-- CreateIndex
CREATE INDEX "restaurant_reviews_user_id_idx" ON "restaurant_reviews"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_reviews_external_uuid_idx" ON "restaurant_reviews"("external_uuid");

-- CreateIndex
CREATE INDEX "restaurant_reviews_external_uuid_user_id_idx" ON "restaurant_reviews"("external_uuid", "user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "accounts_category_identification_idx" ON "accounts"("category", "identification");

-- CreateIndex
CREATE INDEX "accounts_identification_password_idx" ON "accounts"("identification", "password");

-- CreateIndex
CREATE INDEX "agreements_user_id_idx" ON "agreements"("user_id");

-- CreateIndex
CREATE INDEX "agreements_user_id_category_idx" ON "agreements"("user_id", "category");

-- CreateIndex
CREATE INDEX "authentications_user_id_idx" ON "authentications"("user_id");

-- CreateIndex
CREATE INDEX "authentications_identification_idx" ON "authentications"("identification");

-- CreateIndex
CREATE INDEX "authentications_user_id_category_idx" ON "authentications"("user_id", "category");

-- CreateIndex
CREATE INDEX "authentications_user_id_category_state_idx" ON "authentications"("user_id", "category", "state");

-- CreateIndex
CREATE INDEX "authentications_user_id_identification_category_idx" ON "authentications"("user_id", "identification", "category");

-- CreateIndex
CREATE INDEX "authentication_histories_user_id_idx" ON "authentication_histories"("user_id");

-- CreateIndex
CREATE INDEX "authentication_histories_identification_type_idx" ON "authentication_histories"("identification", "type");

-- CreateIndex
CREATE INDEX "authentication_histories_identification_type_code_idx" ON "authentication_histories"("identification", "type", "code");
