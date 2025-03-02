/*
  Warnings:

  - Changed the type of `serviceType` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "serviceType",
ADD COLUMN     "serviceType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ServiceType";
