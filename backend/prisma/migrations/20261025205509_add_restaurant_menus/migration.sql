-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "nameHe" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemSize" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "MenuItemSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemTopping" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "toppingId" TEXT NOT NULL,
    "nameHe" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "extraPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "MenuItemTopping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_businessId_productId_key" ON "MenuItem"("businessId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemSize_menuItemId_size_key" ON "MenuItemSize"("menuItemId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemTopping_menuItemId_toppingId_key" ON "MenuItemTopping"("menuItemId", "toppingId");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemSize" ADD CONSTRAINT "MenuItemSize_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemTopping" ADD CONSTRAINT "MenuItemTopping_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
