-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paymentProvider" TEXT,
                      ADD COLUMN "invoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentProvider_invoiceId_key" ON "Payment"("paymentProvider", "invoiceId");
