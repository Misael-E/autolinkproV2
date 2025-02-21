-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer"
ALTER COLUMN "postalCode" DROP NOT NULL,
ALTER COLUMN "subscription" DROP NOT NULL,
ALTER COLUMN "returnCounter" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "costBeforeGst" TEXT,
ADD COLUMN     "gasCost" TEXT,
ADD COLUMN     "materialCost" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "shopFees" TEXT;

-- CreateTable
CREATE TABLE "Revenue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalWindshields" INTEGER NOT NULL,
    "totalChipRepairs" INTEGER NOT NULL,
    "totalWarranties" INTEGER NOT NULL,
    "grossSales" INTEGER NOT NULL,
    "costBeforeGst" INTEGER,
    "costAfterGst" INTEGER,
    "gstOnJob" INTEGER,
    "gasCost" INTEGER,
    "materialCost" INTEGER NOT NULL,
    "shopFees" INTEGER,
    "labour" INTEGER,
    "jobNet" INTEGER,
    "subNet" INTEGER,
    "trueNet" INTEGER,
    "visa" INTEGER NOT NULL,
    "mastercard" INTEGER NOT NULL,
    "debit" INTEGER NOT NULL,
    "cash" INTEGER NOT NULL,
    "etransfer" INTEGER NOT NULL,
    "amex" INTEGER NOT NULL,
    "newClients" INTEGER,
    "repeatClients" INTEGER,
    "serviceId" INTEGER,
    "companyId" TEXT,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
