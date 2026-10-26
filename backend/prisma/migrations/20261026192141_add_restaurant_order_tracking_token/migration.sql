/*
  Warnings:

  - A unique constraint covering the columns `[trackingToken]` on the table `RestaurantOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RestaurantOrder" ADD COLUMN     "trackingToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOrder_trackingToken_key" ON "RestaurantOrder"("trackingToken");
