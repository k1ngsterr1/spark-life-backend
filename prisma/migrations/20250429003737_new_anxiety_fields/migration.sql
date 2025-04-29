-- CreateTable
CREATE TABLE "AnxietyCheck" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answers" TEXT[],
    "anxiety_level" INTEGER NOT NULL,
    "stress_level" INTEGER NOT NULL,
    "emotional_stability" INTEGER NOT NULL,
    "energy_level" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnxietyCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnxietyCheck" ADD CONSTRAINT "AnxietyCheck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
