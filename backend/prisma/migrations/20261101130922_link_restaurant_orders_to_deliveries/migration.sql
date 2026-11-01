/*
  Warnings:

  - A unique constraint covering the columns `[restaurantOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "restaurantOrderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Order_restaurantOrderId_key" ON "Order"("restaurantOrderId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantOrderId_fkey" FOREIGN KEY ("restaurantOrderId") REFERENCES "RestaurantOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
