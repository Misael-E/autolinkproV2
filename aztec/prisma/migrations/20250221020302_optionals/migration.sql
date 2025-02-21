/*
  Warnings:

  - You are about to drop the column `materials` on the `Revenue` table. All the data in the column will be lost.
  - Added the required column `materialCost` to the `Revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "materials",
ADD COLUMN     "gasCost" INTEGER,
ADD COLUMN     "materialCost" INTEGER NOT NULL;
