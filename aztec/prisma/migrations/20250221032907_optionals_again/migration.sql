/*
  Warnings:

  - You are about to drop the column `glassCost` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `glassCost` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "glassCost";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "glassCost",
ADD COLUMN     "costBeforeGst" TEXT;
