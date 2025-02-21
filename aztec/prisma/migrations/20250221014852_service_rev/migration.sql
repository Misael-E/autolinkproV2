/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Revenue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Revenue" DROP CONSTRAINT "Revenue_invoiceId_fkey";

-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "invoiceId",
ADD COLUMN     "serviceId" INTEGER;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
