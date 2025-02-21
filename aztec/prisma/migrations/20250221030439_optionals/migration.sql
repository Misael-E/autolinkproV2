/*
  Warnings:

  - You are about to drop the column `netProfit` on the `Revenue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "netProfit",
ADD COLUMN     "jobNet" INTEGER,
ADD COLUMN     "subNet" INTEGER,
ADD COLUMN     "trueNet" INTEGER,
ALTER COLUMN "costAfterGst" DROP NOT NULL,
ALTER COLUMN "costBeforeGst" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
