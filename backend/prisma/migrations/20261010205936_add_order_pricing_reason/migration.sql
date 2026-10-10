-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFeeReason" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "deliveryFeeReasonDetails" TEXT;
