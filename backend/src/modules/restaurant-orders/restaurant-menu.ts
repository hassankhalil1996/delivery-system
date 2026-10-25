
export const restaurantMenu = {
  classic: {
    name: "Classic Pizza",
    prices: { small: 35, family: 60, giant: 100 },
  },
  stuffed: {
    name: "Stuffed Crust Pizza",
    prices: { small: 40, family: 80, giant: 120 },
  },
  fish: {
    name: "Fish Pizza",
    prices: { small: 50, family: 70, giant: 90 },
  },
} as const;

export const toppingPrices = {
  olives: 0,
  mushrooms: 0,
  corn: 0,
  onion: 5,
  pepper: 5,
  tomato: 5,
  jalapeno: 5,
  pepperoni: 10,
  tuna: 10,
} as const;

export const drinksMenu = {
  cola: { name: "Cola", price: 7 },
  zero: { name: "Cola Zero", price: 7 },
  sprite: { name: "Sprite", price: 7 },
  xl: { name: "XL", price: 7 },
  water: { name: "Water", price: 7 },
} as const;
