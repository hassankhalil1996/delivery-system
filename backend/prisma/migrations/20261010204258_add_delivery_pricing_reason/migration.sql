-- AlterTable
ALTER TABLE "DeliveryPricing" ADD COLUMN     "reason" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "reasonDetails" TEXT;
