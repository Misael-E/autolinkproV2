-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "invoiceId" INTEGER;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
