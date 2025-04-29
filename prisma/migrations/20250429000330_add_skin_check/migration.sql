-- CreateTable
CREATE TABLE "SkinCheck" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "check_id" INTEGER NOT NULL,
    "check_datetime" TIMESTAMP(3) NOT NULL,
    "class" TEXT NOT NULL,
    "class_raw" TEXT NOT NULL,
    "desease" TEXT NOT NULL,
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

    CONSTRAINT "SkinCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkinCheck_uid_key" ON "SkinCheck"("uid");

-- AddForeignKey
ALTER TABLE "SkinCheck" ADD CONSTRAINT "SkinCheck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
