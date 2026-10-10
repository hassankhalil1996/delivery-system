-- CreateTable
CREATE TABLE "DeliveryPricing" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPricing_area_key" ON "DeliveryPricing"("area");
