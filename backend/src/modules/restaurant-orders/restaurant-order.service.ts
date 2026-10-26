
import { prisma } from "../../lib/prisma.js";
import { randomBytes } from "node:crypto";
import { getSocketIO } from "../../socket.js";

export async function getRestaurantOrders(businessId: number) {
  return prisma.restaurantOrder.findMany({
    where: {
      businessId,
    },
    omit: {
      trackingToken: true,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRestaurantOrderById(
  orderId: number,
  businessId: number
) {
  return prisma.restaurantOrder.findFirst({
    where: {
      id: orderId,
      businessId,
    },
    omit: {
      trackingToken: true,
    },
    include: {
      items: true,
    },
  });
}


export type CustomerOrderItem = {
  productId: string;
  size?: string;
  toppingIds?: string[];
  quantity: number;
};

export type CreateRestaurantOrderInput = {
  businessId: number;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  notes?: string;
  items: CustomerOrderItem[];
};

export class InvalidRestaurantOrderError extends Error {}

export async function createRestaurantOrder(
  input: CreateRestaurantOrderInput
) {
  if (
    !Number.isSafeInteger(input.businessId) ||
    input.businessId <= 0 ||
    !input.customerName?.trim() ||
    !input.customerPhone?.trim() ||
    !input.area?.trim() ||
    !input.address?.trim() ||
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 30
  ) {
    throw new InvalidRestaurantOrderError("Invalid order data");
  }

  const business = await prisma.business.findFirst({
    where: {
      id: input.businessId,
      isActive: true,
    },
  });

  if (!business) {
    throw new InvalidRestaurantOrderError(
      "Restaurant not found or inactive"
    );
  }

  const orderItems = [];
  let foodTotalCents = 0;

  for (const requestedItem of input.items) {
    const {
      productId,
      size,
      toppingIds = [],
      quantity,
    } = requestedItem;

    if (
      typeof productId !== "string" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 20 ||
      !Array.isArray(toppingIds) ||
      toppingIds.length > 20 ||
      toppingIds.some(id => typeof id !== "string") ||
      new Set(toppingIds).size !== toppingIds.length
    ) {
      throw new InvalidRestaurantOrderError(
        "Invalid cart item"
      );
    }

    const product = await prisma.menuItem.findUnique({
      where: {
        businessId_productId: {
          businessId: input.businessId,
          productId,
        },
      },
      include: {
        sizes: true,
        toppings: true,
      },
    });

    if (!product || !product.isActive) {
      throw new InvalidRestaurantOrderError(
        `Product unavailable: ${productId}`
      );
    }

    let unitPriceCents = Math.round(
      Number(product.basePrice) * 100
    );

    if (product.sizes.length > 0) {
      const selectedSize = product.sizes.find(
        s => s.size === size
      );

      if (!selectedSize) {
        throw new InvalidRestaurantOrderError(
          `Invalid size for ${productId}`
        );
      }

      unitPriceCents = Math.round(
        Number(selectedSize.price) * 100
      );
    } else if (size !== undefined && size !== null) {
      throw new InvalidRestaurantOrderError(
        `Size not supported for ${productId}`
      );
    }

    const selectedToppings = [];

    for (const toppingId of toppingIds) {
      const topping = product.toppings.find(
        t => t.toppingId === toppingId
      );

      if (!topping) {
        throw new InvalidRestaurantOrderError(
          `Invalid topping: ${toppingId}`
        );
      }

      unitPriceCents += Math.round(
        Number(topping.extraPrice) * 100
      );

      selectedToppings.push({
        id: topping.toppingId,
        name: topping.nameAr,
        price: Number(topping.extraPrice),
      });
    }

    foodTotalCents += unitPriceCents * quantity;

    orderItems.push({
      productId,
      productName: product.nameAr,
      size: size ?? null,
      quantity,
      unitPrice: unitPriceCents / 100,
      toppings: selectedToppings,
    });
  }

  return prisma.restaurantOrder.create({
    data: {
      trackingToken: randomBytes(32).toString("hex"),
      businessId: input.businessId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      area: input.area.trim(),
      address: input.address.trim(),
      notes: input.notes?.trim(),
      foodTotal: foodTotalCents / 100,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
    },
  });
}


export async function acceptRestaurantOrder(
  orderId: number,
  businessId: number,
  prepMinutes: number
) {
  if (
    !Number.isSafeInteger(prepMinutes) ||
    prepMinutes < 1 ||
    prepMinutes > 180
  ) {
    throw new InvalidRestaurantOrderError(
      "Preparation time must be between 1 and 180 minutes"
    );
  }

  const result = await prisma.restaurantOrder.updateMany({
    where: {
      id: orderId,
      businessId,
      status: "PENDING",
    },
    data: {
      status: "ACCEPTED",
      prepMinutes,
    },
  });

  if (result.count === 0) {
    throw new InvalidRestaurantOrderError(
      "Order not found or no longer pending"
    );
  }

  const order = await getRestaurantOrderById(orderId, businessId);

  getSocketIO()
    .to(`restaurant-order:${orderId}`)
    .emit("restaurant-order:updated", {
      id: orderId,
      status: "ACCEPTED",
      prepMinutes,
    });

  return order;
}

export async function rejectRestaurantOrder(
  orderId: number,
  businessId: number
) {
  const result = await prisma.restaurantOrder.updateMany({
    where: {
      id: orderId,
      businessId,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
    },
  });

  if (result.count === 0) {
    throw new InvalidRestaurantOrderError(
      "Order not found or no longer pending"
    );
  }

  const order = await getRestaurantOrderById(orderId, businessId);

  getSocketIO()
    .to(`restaurant-order:${orderId}`)
    .emit("restaurant-order:updated", {
      id: orderId,
      status: "REJECTED",
      prepMinutes: null,
    });

  return order;
}

export async function getRestaurantOrderTracking(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  return prisma.restaurantOrder.findUnique({
    where: { trackingToken: token },
    select: {
      id: true,
      status: true,
      prepMinutes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}