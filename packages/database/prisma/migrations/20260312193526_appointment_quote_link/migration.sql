-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "quoteId" INTEGER;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
