
import { prisma } from "../src/lib/prisma.js";

const BUSINESS_ID = 2;

const pizzas = [
  {
    id: "classic",
    nameHe: "פיצה נאפולי קלאסית",
    nameAr: "بيتزا نابولي الكلاسيكية",
    prices: { small: 35, family: 60, giant: 100 },
  },
  {
    id: "stuffed",
    nameHe: "פיצה עם שוליים ממולאים",
    nameAr: "بيتزا بأطراف محشية",
    prices: { small: 40, family: 80, giant: 120 },
  },
  {
    id: "fish",
    nameHe: "פיצת הדג",
    nameAr: "بيتزا السمكة",
    prices: { small: 50, family: 70, giant: 90 },
  },
];

const toppings = [
  ["olives", "זיתים", "زيتون", 0],
  ["mushrooms", "פטריות", "فطر", 0],
  ["corn", "תירס", "ذرة", 0],
  ["onion", "בצל", "بصل", 5],
  ["pepper", "גמבה", "فلفل حلو", 5],
  ["tomato", "עגבנייה", "بندورة", 5],
  ["jalapeno", "חלפיניו", "هالبينو", 5],
  ["pepperoni", "פפרוני", "بيبروني", 10],
  ["tuna", "טונה", "تونة", 10],
] as const;

const drinks = [
  ["cola", "קולה", "كولا"],
  ["zero", "קולה זירו", "كولا زيرو"],
  ["sprite", "ספרייט", "سبرايت"],
  ["xl", "XL", "XL"],
  ["water", "מים", "مياه"],
] as const;

async function main() {
  const business = await prisma.business.findUnique({
    where: { id: BUSINESS_ID },
  });

  if (!business?.isActive) {
    throw new Error("Pizza Napoli business not found or inactive");
  }

  for (const pizza of pizzas) {
    const item = await prisma.menuItem.upsert({
      where: {
        businessId_productId: {
          businessId: BUSINESS_ID,
          productId: pizza.id,
        },
      },
      update: {
        nameHe: pizza.nameHe,
        nameAr: pizza.nameAr,
        isActive: true,
      },
      create: {
        businessId: BUSINESS_ID,
        productId: pizza.id,
        nameHe: pizza.nameHe,
        nameAr: pizza.nameAr,
        basePrice: pizza.prices.small,
      },
    });

    for (const [size, price] of Object.entries(pizza.prices)) {
      await prisma.menuItemSize.upsert({
        where: {
          menuItemId_size: {
            menuItemId: item.id,
            size,
          },
        },
        update: { price },
        create: {
          menuItemId: item.id,
          size,
          price,
        },
      });
    }

    for (const [toppingId, nameHe, nameAr, extraPrice] of toppings) {
      await prisma.menuItemTopping.upsert({
        where: {
          menuItemId_toppingId: {
            menuItemId: item.id,
            toppingId,
          },
        },
        update: { nameHe, nameAr, extraPrice },
        create: {
          menuItemId: item.id,
          toppingId,
          nameHe,
          nameAr,
          extraPrice,
        },
      });
    }
  }

  for (const [productId, nameHe, nameAr] of drinks) {
    await prisma.menuItem.upsert({
      where: {
        businessId_productId: {
          businessId: BUSINESS_ID,
          productId,
        },
      },
      update: {
        nameHe,
        nameAr,
        basePrice: 7,
        isActive: true,
      },
      create: {
        businessId: BUSINESS_ID,
        productId,
        nameHe,
        nameAr,
        basePrice: 7,
      },
    });
  }

  console.log("Pizza Napoli menu seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
