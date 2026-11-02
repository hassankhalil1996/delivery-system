
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
  notes?: string;
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
      notes,
    } = requestedItem;

    if (
      typeof productId !== "string" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 20 ||
      !Array.isArray(toppingIds) ||
      toppingIds.length > 20 ||
      toppingIds.some(id => typeof id !== "string") ||
      new Set(toppingIds).size !== toppingIds.length ||
      (notes !== undefined &&
        (typeof notes !== "string" || notes.length > 500))
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
    
    if (input.businessId === 9) {
      const pizzaIds = new Set([
        "pizza-family",
        "pizza-small",
      ]);

      const burgerIds = new Set([
        "burger-125",
        "burger-240",
        "burger-300",
        "burger-500",
      ]);

      const burgerRemovalIds = new Set([
        "no-tomato",
        "no-lettuce",
        "no-onion",
        "no-pickles",
        "no-sauce",
        "no-salads",
      ]);

      const burgerExtraIds = new Set([
        "cheddar",
        "fried-mushrooms",
        "crispy-onion",
        "chips",
        "extra-patty",
      ]);

      if (pizzaIds.has(productId)) {
        if (toppingIds.length > 8) {
          throw new InvalidRestaurantOrderError(
            "Maximum 8 pizza toppings allowed"
          );
        }
      } else if (burgerIds.has(productId)) {
        const removals = toppingIds.filter((id) =>
          burgerRemovalIds.has(id)
        );

        const extras = toppingIds.filter((id) =>
          burgerExtraIds.has(id)
        );

        if (removals.length > 6 || extras.length > 6) {
          throw new InvalidRestaurantOrderError(
            "Too many burger customizations"
          );
        }
      } else if (toppingIds.length > 0) {
        throw new InvalidRestaurantOrderError(
          `Customizations not supported for ${productId}`
        );
      }
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
      notes: notes?.trim() || null,
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

  const estimatedReadyAt = new Date(
    Date.now() + prepMinutes * 60_000
  );

  const result = await prisma.$transaction(async (tx) => {
    const restaurantOrder = await tx.restaurantOrder.findFirst({
      where: {
        id: orderId,
        businessId,
        status: "PENDING",
      },
    });

    if (!restaurantOrder) {
      throw new InvalidRestaurantOrderError(
        "Order not found or no longer pending"
      );
    }

    const pricing = await tx.deliveryPricing.findUnique({
      where: { area: restaurantOrder.area },
    });

    if (!pricing) {
      throw new InvalidRestaurantOrderError(
        "Delivery pricing is not configured for this area"
      );
    }

    // Claim the pending order before creating a delivery.
    const updated = await tx.restaurantOrder.updateMany({
      where: {
        id: orderId,
        businessId,
        status: "PENDING",
      },
      data: {
        status: "ACCEPTED",
        prepMinutes,
        estimatedReadyAt,
      },
    });

    if (updated.count !== 1) {
      throw new InvalidRestaurantOrderError(
        "Order has already been accepted"
      );
    }

    const delivery = await tx.order.create({
      data: {
        restaurantOrderId: orderId,
        businessId,
        customerName: restaurantOrder.customerName,
        customerPhone: restaurantOrder.customerPhone,
        area: restaurantOrder.area,
        address: restaurantOrder.address,
        orderPrice: restaurantOrder.foodTotal,
        deliveryFee: pricing.fee,
        deliveryFeeReason: pricing.reason,
        deliveryFeeReasonDetails: pricing.reasonDetails,
        prepMinutes,
        notes: restaurantOrder.notes,
      },
    });

    return { delivery };
  });

  const order = await getRestaurantOrderById(
    orderId,
    businessId
  );

  // Notify the customer after the transaction commits.
  try {
    getSocketIO()
      .to(`restaurant-order:${orderId}`)
      .emit("restaurant-order:updated", {
        id: orderId,
        status: "ACCEPTED",
        prepMinutes,
        estimatedReadyAt,
      });

    // Notify courier dashboards about the new delivery.
    getSocketIO()
      .to("couriers")
      .to(`business:${businessId}`)
      .to("admins")
      .emit("order:changed", {
        orderId: result.delivery.id,
      });
  } catch (error) {
    console.error("Socket.IO notification failed:", error);
  }

  return order;
}


export async function startPreparingRestaurantOrder(
  orderId: number,
  businessId: number
) {
  const result = await prisma.restaurantOrder.updateMany({
    where: {
      id: orderId,
      businessId,
      status: "ACCEPTED",
    },
    data: {
      status: "PREPARING",
    },
  });

  if (result.count === 0) {
    throw new InvalidRestaurantOrderError(
      "Order not found or not accepted"
    );
  }

  const order = await getRestaurantOrderById(orderId, businessId);

  getSocketIO()
    .to(`restaurant-order:${orderId}`)
    .emit("restaurant-order:updated", {
      id: orderId,
      status: "PREPARING",
      prepMinutes: order?.prepMinutes,
      estimatedReadyAt: order?.estimatedReadyAt,
    });

  return order;
}

export async function markRestaurantOrderReady(
  orderId: number,
  businessId: number
) {
  
  const result = await prisma.$transaction(async (tx) => {
  const updated = await tx.restaurantOrder.updateMany({
    where: {
      id: orderId,
      businessId,
      status: {
        in: ["ACCEPTED", "PREPARING"],
      },
    },
    data: {
      status: "READY",
    },
  });

  if (updated.count !== 1) {
    return { count: 0, delivery: null };
  }

  const delivery = await tx.order.findUnique({
    where: { restaurantOrderId: orderId },
  });

  if (delivery) {
    await tx.order.update({
      where: { id: delivery.id },
      data: { isReady: true },
    });
  }

  return { count: updated.count, delivery };
});

  if (result.count === 0) {
    throw new InvalidRestaurantOrderError(
      "Order not found or cannot be marked ready"
    );
  }

  const order = await getRestaurantOrderById(orderId, businessId);

  getSocketIO()
    .to(`restaurant-order:${orderId}`)
    .emit("restaurant-order:updated", {
      id: orderId,
      status: "READY",
      prepMinutes: order?.prepMinutes,
      estimatedReadyAt: order?.estimatedReadyAt,
    });

    if (result.delivery) {
  try {
    getSocketIO()
      .to("couriers")
      .to(`business:${businessId}`)
      .to("admins")
      .emit("order:changed", {
        orderId: result.delivery.id,
      });
  } catch (error) {
    console.error("Courier notification failed:", error);
  }
}

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
      estimatedReadyAt: null,
    });

  return order;
}

export async function getRestaurantOrderTracking(
  token: string
) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  return prisma.restaurantOrder.findUnique({
    where: {
      trackingToken: token,
    },
    select: {
      id: true,
      status: true,
      prepMinutes: true,
      estimatedReadyAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}