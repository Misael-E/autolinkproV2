/*
  Warnings:

  - Added the required column `costAfterGst` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costBeforeGst` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialCost` to the `Revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "costAfterGst" INTEGER NOT NULL,
ADD COLUMN     "costBeforeGst" INTEGER NOT NULL,
ADD COLUMN     "gasCost" INTEGER,
ADD COLUMN     "glassCost" INTEGER,
ADD COLUMN     "materialCost" INTEGER NOT NULL,
ADD COLUMN     "shopFees" INTEGER;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "gasCost" TEXT,
ADD COLUMN     "glassCost" TEXT,
ADD COLUMN     "materialCost" TEXT,
ADD COLUMN     "shopFees" TEXT;
