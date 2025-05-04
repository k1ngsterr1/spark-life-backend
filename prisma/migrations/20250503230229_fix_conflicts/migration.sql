/*
  Warnings:

  - You are about to drop the column `detailed_skin_check_id` on the `UserDetailedSkinCheck` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `UserDetailedSkinCheck` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,detailedSkinCheckId]` on the table `UserDetailedSkinCheck` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `detailedSkinCheckId` to the `UserDetailedSkinCheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserDetailedSkinCheck` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserDetailedSkinCheck" DROP CONSTRAINT "UserDetailedSkinCheck_detailed_skin_check_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDetailedSkinCheck" DROP CONSTRAINT "UserDetailedSkinCheck_user_id_fkey";

-- DropIndex
DROP INDEX "UserDetailedSkinCheck_detailed_skin_check_id_idx";

-- DropIndex
DROP INDEX "UserDetailedSkinCheck_user_id_detailed_skin_check_id_key";

-- DropIndex
DROP INDEX "UserDetailedSkinCheck_user_id_idx";

-- AlterTable
ALTER TABLE "UserDetailedSkinCheck" DROP COLUMN "detailed_skin_check_id",
DROP COLUMN "user_id",
ADD COLUMN     "detailedSkinCheckId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Transcript" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDetailedSkinCheck_userId_detailedSkinCheckId_key" ON "UserDetailedSkinCheck"("userId", "detailedSkinCheckId");

-- AddForeignKey
ALTER TABLE "UserDetailedSkinCheck" ADD CONSTRAINT "UserDetailedSkinCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetailedSkinCheck" ADD CONSTRAINT "UserDetailedSkinCheck_detailedSkinCheckId_fkey" FOREIGN KEY ("detailedSkinCheckId") REFERENCES "DetailedSkinCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
