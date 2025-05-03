/*
  Warnings:

  - You are about to drop the column `details` on the `DetailedSkinCheck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DetailedSkinCheck" DROP COLUMN "details";

-- AddForeignKey
ALTER TABLE "UserDetailedSkinCheck" ADD CONSTRAINT "UserDetailedSkinCheck_detailed_skin_check_id_fkey" FOREIGN KEY ("detailed_skin_check_id") REFERENCES "DetailedSkinCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
