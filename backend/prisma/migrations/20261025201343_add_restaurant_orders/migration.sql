-- CreateEnum
CREATE TYPE "RestaurantOrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "RestaurantOrder" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "status" "RestaurantOrderStatus" NOT NULL DEFAULT 'PENDING',
    "foodTotal" DECIMAL(10,2) NOT NULL,
    "prepMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantOrderItem" (
    "id" SERIAL NOT NULL,
    "restaurantOrderId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "toppings" JSONB,

    CONSTRAINT "RestaurantOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RestaurantOrder_businessId_status_idx" ON "RestaurantOrder"("businessId", "status");

-- CreateIndex
CREATE INDEX "RestaurantOrder_createdAt_idx" ON "RestaurantOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "RestaurantOrder" ADD CONSTRAINT "RestaurantOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantOrderItem" ADD CONSTRAINT "RestaurantOrderItem_restaurantOrderId_fkey" FOREIGN KEY ("restaurantOrderId") REFERENCES "RestaurantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
