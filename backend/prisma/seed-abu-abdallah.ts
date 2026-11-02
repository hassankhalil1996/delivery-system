
import { prisma } from "../src/lib/prisma.js";

const BUSINESS_ID = 9;

const products = [
  // Pizza
  ["pizza-family", "פיצה משפחתית", "بيتسا عائلية", 60],
  ["pizza-small", "פיצה קטנה", "بيتسا صغير", 40],

  // Burgers and meals
  ["family-meal", "ארוחה משפחתית (5 ארוחות)", "وجبة عائلية (5 وجبات)", 200],
  ["burger-125", "ארוחת המבורגר 125 גרם", "وجبة بورجر صنع يدوي 120-125 غرام", 40],
  ["burger-240", "ארוחת המבורגר 240 גרם", "وجبة بورجر صنع يدوي 200-240 غرام", 55],
  ["schnitzel-meal", "ארוחת שניצל", "وجبة شنيتسل", 40],
  ["crispy-meal", "ארוחת קריספי צ'יקן", "وجبة كرسبي تشيكن", 40],
  ["fried-chicken-roll", "רול עוף מטוגן", "رول تشيكن مقلي", 45],
  ["crispy-bucket", "דלי עוף קריספי משפחתי 1 קילו", "سطل دجاج كرسبي مشكل (1 كيلو عائلي)", 130],
  ["burger-300", "המבורגר 300 גרם", "برجر يدوي 300g", 70],
  ["burger-500", "המבורגר 500 גרם", "برجر يدوي نصف كيلو 500g", 100],
  ["chicken-breast-meal", "ארוחת חזה עוף", "وجبة صدر دجاج", 45],
  ["crispy-3", "ארוחת קריספי 3 יחידות", "كرسبي تشيكن مقلي 3 قطع", 45],

  // Salads
  ["chicken-salad", "סלט חזה עוף", "سلطة صدر دجاج", 45],
  ["schnitzel-salad", "סלט שניצל", "سلطة شنيتسل", 45],

  // Sides
  ["onion-rings", "6 טבעות בצל", "6 حلقات بصل", 10],
  ["cheese-sticks", "3 אצבעות גבינה", "3 أصابع جبنة", 10],
  ["potato-balls", "7 כדורי תפוח אדמה", "7 كرات بطاطا", 10],
  ["sweet-potato", "בטטה מטוגנת", "بطاطا حلوة مقلية", 10],
  ["chili-potatoes", "קוביות תפוח אדמה בצ'ילי", "مربعات بطاطا مع تشيلي", 25],
  ["mix", "מיקס", "ميكس", 35],
  ["fries", "צ'יפס", "شيبس", 10],

  // Drinks
  ["cola", "קולה", "كولا", 7],
  ["cola-zero", "קולה זירו", "كولا زيرو", 7],
  ["sprite", "ספרייט", "سبرايت", 7],
  ["fanta", "פאנטה", "فانتا", 7],
  ["fanta-grape", "פאנטה ענבים", "فانتا عنب", 7],
  ["grape-juice", "מיץ ענבים", "عصير عنب", 7],
  ["berry-drink", "משקה פירות יער", "توت بنا", 7],
  ["blue-drink", "משקה בלו", "بلو", 7],
  ["soda", "סודה 250 מ״ל", "صودا 250ml", 7],
  ["xl", "XL", "XL", 7],
  ["xl-ten", "XL Ten", "XL Ten", 7],
  ["pepsi", "פפסי קולה", "بيبسي كولا إسرائيلي", 7],
  ["water", "מים מינרליים 500 מ״ל", "مياه معدنية 500ml", 5],
  ["cola-large", "קולה גדול", "كولا كبير", 15],
  ["cola-zero-large", "קולה זירו גדול", "كولا زيرو كبير", 15],
  ["sprite-large", "ספרייט גדול", "سبرايت كبير", 15],
] as const;


const pizzaToppings = [
  ["olives", "זיתים", "زيتون", 0],
  ["corn", "תירס", "ذرة", 0],
  ["mushrooms", "פטריות", "فقع", 0],
  ["tuna", "טונה", "تونا", 10],
  ["tomato", "עגבנייה", "بندورة", 5],
  ["cheese", "גבינה", "جبنة", 5],
  ["onion", "בצל", "بصل", 5],
  ["salami", "סלמי", "سلامي", 10],
] as const;

const burgerToppings = [
  // Ingredient removals
  ["no-tomato", "בלי עגבנייה", "بدون بندورة", 0],
  ["no-lettuce", "בלי חסה", "بدون خس", 0],
  ["no-onion", "בלי בצל", "بدون بصل", 0],
  ["no-pickles", "בלי חמוצים", "بدون خيار مكبوس", 0],
  ["no-sauce", "בלי רוטב", "بدون صلصة", 0],
  ["no-salads", "בלי סלטים", "بدون سلطات", 0],

  // Paid additions
  ["cheddar", "גבינת צ'דר", "جبنة تشيدر", 5],
  ["fried-mushrooms", "פטריות מטוגנות", "فقع مقلي", 5],
  ["crispy-onion", "בצל קריספי", "بصل كرسبي", 3],
  ["chips", "צ'יפס", "شيبس", 5],
  ["extra-patty", "קציצת המבורגר נוספת", "شريحة همبرجر", 15],
] as const;

const pizzaProductIds = [
  "pizza-family",
  "pizza-small",
];

const burgerProductIds = [
  "burger-125",
  "burger-240",
  "burger-300",
  "burger-500",
];


async function seedToppings(
  productId: string,
  toppings: readonly (
    readonly [string, string, string, number]
  )[]
) {
  const product = await prisma.menuItem.findUnique({
    where: {
      businessId_productId: {
        businessId: BUSINESS_ID,
        productId,
      },
    },
  });

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  for (const [
    toppingId,
    nameHe,
    nameAr,
    extraPrice,
  ] of toppings) {
    await prisma.menuItemTopping.upsert({
      where: {
        menuItemId_toppingId: {
          menuItemId: product.id,
          toppingId,
        },
      },
      update: {
        nameHe,
        nameAr,
        extraPrice,
      },
      create: {
        menuItemId: product.id,
        toppingId,
        nameHe,
        nameAr,
        extraPrice,
      },
    });
  }
}


async function main() {
  const business = await prisma.business.findUnique({
    where: { id: BUSINESS_ID },
  });

  if (!business?.isActive) {
    throw new Error("Abu Abdallah business not found or inactive");
  }

  for (const [productId, nameHe, nameAr, price] of products) {
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
        basePrice: price,
        isActive: true,
      },
      create: {
        businessId: BUSINESS_ID,
        productId,
        nameHe,
        nameAr,
        basePrice: price,
        isActive: true,
      },
    });
  }

  
for (const productId of pizzaProductIds) {
  await seedToppings(productId, pizzaToppings);
}

for (const productId of burgerProductIds) {
  await seedToppings(productId, burgerToppings);
}


  console.log(
    `Abu Abdallah menu seeded: ${products.length} products`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
