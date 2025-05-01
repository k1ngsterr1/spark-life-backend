-- CreateTable
CREATE TABLE "DentalCheck" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "result" JSONB NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DentalCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DoctorServices" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DoctorServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "DentalCheck_user_id_idx" ON "DentalCheck"("user_id");

-- CreateIndex
CREATE INDEX "_DoctorServices_B_index" ON "_DoctorServices"("B");

-- AddForeignKey
ALTER TABLE "DentalCheck" ADD CONSTRAINT "DentalCheck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorServices" ADD CONSTRAINT "_DoctorServices_A_fkey" FOREIGN KEY ("A") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorServices" ADD CONSTRAINT "_DoctorServices_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
