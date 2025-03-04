/*
  Warnings:

  - The `paymentType` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `paymentType` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" TEXT;

-- DropEnum
DROP TYPE "PaymentType";
