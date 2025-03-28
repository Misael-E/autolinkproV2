-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "invoiceId" INTEGER,
ADD COLUMN     "statementId" INTEGER,
ALTER COLUMN "jobNet" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "subNet" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "trueNet" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Statement" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "distributor" "Distributor" NOT NULL,
    "grossSalesGst" DOUBLE PRECISION,
    "costBeforeGst" DOUBLE PRECISION,
    "costAfterGst" DOUBLE PRECISION,
    "amountPaid" DOUBLE PRECISION,
    "amountDue" DOUBLE PRECISION,
    "invoiceAmount" DOUBLE PRECISION,
    "currentAmount" DOUBLE PRECISION,
    "thirtyDayAmount" DOUBLE PRECISION,
    "sixtyDayAmount" DOUBLE PRECISION,
    "sixtyPlusAmount" DOUBLE PRECISION,
    "invoiceId" INTEGER,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "statementId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT,
    "note" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
