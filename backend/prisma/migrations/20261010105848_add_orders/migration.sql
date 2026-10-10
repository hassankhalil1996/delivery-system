-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'DELIVERED', 'CANCELED');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "orderPrice" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "prepMinutes" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_businessId_createdAt_idx" ON "Order"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
