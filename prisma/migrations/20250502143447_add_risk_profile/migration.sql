-- CreateTable
CREATE TABLE "RiskProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "risk_factors" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskProfile_user_id_key" ON "RiskProfile"("user_id");

-- AddForeignKey
ALTER TABLE "RiskProfile" ADD CONSTRAINT "RiskProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
