/*
  Warnings:

  - The `distributor` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `distributor` column on the `Statement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "distributor",
ADD COLUMN     "distributor" TEXT;

-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "distributor",
ADD COLUMN     "distributor" TEXT;

-- DropEnum
DROP TYPE "Distributor";
