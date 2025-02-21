/*
  Warnings:

  - You are about to drop the column `customerId` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `expenses` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `gasCost` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `glassCost` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `materialCost` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `transactionCount` on the `Revenue` table. All the data in the column will be lost.
  - Added the required column `amex` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cash` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debit` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `etransfer` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossSales` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstOnJob` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoices` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mastercard` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materials` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netProfit` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newClients` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeatClients` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalChipRepairs` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWarranties` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWindshields` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visa` to the `Revenue` table without a default value. This is not possible if the table is not empty.
  - Made the column `shopFees` on table `Revenue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "customerId",
DROP COLUMN "expenses",
DROP COLUMN "gasCost",
DROP COLUMN "glassCost",
DROP COLUMN "materialCost",
DROP COLUMN "paymentType",
DROP COLUMN "status",
DROP COLUMN "total",
DROP COLUMN "transactionCount",
ADD COLUMN     "amex" INTEGER NOT NULL,
ADD COLUMN     "cash" INTEGER NOT NULL,
ADD COLUMN     "debit" INTEGER NOT NULL,
ADD COLUMN     "etransfer" INTEGER NOT NULL,
ADD COLUMN     "grossSales" INTEGER NOT NULL,
ADD COLUMN     "gstOnJob" INTEGER NOT NULL,
ADD COLUMN     "invoices" INTEGER NOT NULL,
ADD COLUMN     "labour" INTEGER,
ADD COLUMN     "mastercard" INTEGER NOT NULL,
ADD COLUMN     "materials" INTEGER NOT NULL,
ADD COLUMN     "netProfit" INTEGER NOT NULL,
ADD COLUMN     "newClients" INTEGER NOT NULL,
ADD COLUMN     "repeatClients" INTEGER NOT NULL,
ADD COLUMN     "totalChipRepairs" INTEGER NOT NULL,
ADD COLUMN     "totalWarranties" INTEGER NOT NULL,
ADD COLUMN     "totalWindshields" INTEGER NOT NULL,
ADD COLUMN     "visa" INTEGER NOT NULL,
ALTER COLUMN "shopFees" SET NOT NULL;
