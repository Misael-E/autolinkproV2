/*
  Warnings:

  - A unique constraint covering the columns `[firstName,email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_firstName_email_key" ON "Customer"("firstName", "email");
