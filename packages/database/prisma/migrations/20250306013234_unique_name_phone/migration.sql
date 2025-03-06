/*
  Warnings:

  - A unique constraint covering the columns `[firstName,phone]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_firstName_email_key";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_firstName_phone_key" ON "Customer"("firstName", "phone");
