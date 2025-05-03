-- CreateTable
CREATE TABLE "UserDetailedSkinCheck" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "detailed_skin_check_id" INTEGER NOT NULL,

    CONSTRAINT "UserDetailedSkinCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedSkinCheck" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "check_datetime" TIMESTAMP(3) NOT NULL,
    "class" TEXT NOT NULL,
    "class_raw" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "risk_description" TEXT NOT NULL,
    "risk_title" TEXT NOT NULL,
    "short_recommendation" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "masked_s3_url" TEXT NOT NULL,
    "colored_s3_url" TEXT NOT NULL,
    "prob" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "atlas_page_link" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetailedSkinCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDetailedSkinCheck_user_id_idx" ON "UserDetailedSkinCheck"("user_id");

-- CreateIndex
CREATE INDEX "UserDetailedSkinCheck_detailed_skin_check_id_idx" ON "UserDetailedSkinCheck"("detailed_skin_check_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDetailedSkinCheck_user_id_detailed_skin_check_id_key" ON "UserDetailedSkinCheck"("user_id", "detailed_skin_check_id");

-- CreateIndex
CREATE UNIQUE INDEX "DetailedSkinCheck_uid_key" ON "DetailedSkinCheck"("uid");

-- CreateIndex
CREATE INDEX "DetailedSkinCheck_user_id_idx" ON "DetailedSkinCheck"("user_id");

-- AddForeignKey
ALTER TABLE "UserDetailedSkinCheck" ADD CONSTRAINT "UserDetailedSkinCheck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetailedSkinCheck" ADD CONSTRAINT "UserDetailedSkinCheck_detailed_skin_check_id_fkey" FOREIGN KEY ("detailed_skin_check_id") REFERENCES "DetailedSkinCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedSkinCheck" ADD CONSTRAINT "DetailedSkinCheck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
