-- CreateTable
CREATE TABLE "MedicalAnalysis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalAnalysis_user_id_idx" ON "MedicalAnalysis"("user_id");

-- AddForeignKey
ALTER TABLE "MedicalAnalysis" ADD CONSTRAINT "MedicalAnalysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
