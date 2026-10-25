
import { prisma } from "../../lib/prisma.js";
import { isValidArea } from "../pricing/pricing.service.js";
import { getSocketIO } from "../../socket.js";

// =====================================================
// TYPES
// =====================================================

export interface CreateOrderInput {
  businessId: number;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  orderPrice: number;
  prepMinutes: number;
  notes?: string;
}

// =====================================================
// ERRORS
// =====================================================

export class PricingNotConfiguredError extends Error {
  constructor() {
    super("Delivery pricing is not configured for this area");
    this.name = "PricingNotConfiguredError";
  }
}

export class OrderNotAvailableError extends Error {
  constructor() {
    super("This delivery is no longer available");
    this.name = "OrderNotAvailableError";
  }
}

export class InvalidOrderTransitionError extends Error {
  constructor() {
    super(
      "Order status cannot be changed, or this order is not assigned to you"
    );
    this.name = "InvalidOrderTransitionError";
  }
}

// =====================================================
// SOCKET.IO NOTIFICATIONS
// =====================================================

// Notify connected users after an order changes.
// Send only the order ID. Each client will fetch
// the updated data through its authenticated API.
function notifyOrderChanged(
  orderId: number,
  businessId: number,
  courierId?: number | null,
  notifyAllCouriers = false
) {
  try {
    const io = getSocketIO();

    let notification = io
      .to(`business:${businessId}`)
      .to("admins");

    if (notifyAllCouriers) {
      notification = notification.to("couriers");
    } else if (courierId != null) {
      notification = notification.to(`courier:${courierId}`);
    }

    notification.emit("order:changed", { orderId });
  } catch (error) {
    // A notification failure must not undo a successful
    // database operation.
    console.error("Socket.IO notification failed:", error);
  }
}

// =====================================================
// CREATE ORDER
// =====================================================

export async function createOrder(data: CreateOrderInput) {
  if (!isValidArea(data.area)) {
    throw new Error("Invalid delivery area");
  }

  const order = await prisma.$transaction(async (tx) => {
    const pricing = await tx.deliveryPricing.findUnique({
      where: { area: data.area },
    });

    if (!pricing) {
      throw new PricingNotConfiguredError();
    }

    return tx.order.create({
      data: {
        businessId: data.businessId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        area: data.area,
        address: data.address,
        orderPrice: data.orderPrice,
        deliveryFee: pricing.fee,
        deliveryFeeReason: pricing.reason,
        deliveryFeeReasonDetails: pricing.reasonDetails,
        prepMinutes: data.prepMinutes,
        notes: data.notes,
      },
    });
  });

  // New orders should appear on every courier dashboard.
  notifyOrderChanged(
    order.id,
    order.businessId,
    null,
    true
  );

  return order;
}

// =====================================================
// AVAILABLE ORDERS
// =====================================================

export async function getAvailableOrders() {
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  );

  return prisma.order.findMany({
    where: {
      status: "PENDING",
      courierId: null,
      createdAt: {
        gte: threeDaysAgo,
      },
    },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      area: true,
      address: true,
      orderPrice: true,
      deliveryFee: true,
      deliveryFeeReason: true,
      deliveryFeeReasonDetails: true,
      prepMinutes: true,
      notes: true,
      status: true,
      isReady: true,
      createdAt: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// =====================================================
// ACCEPT ORDER
// =====================================================

export async function acceptOrder(
  orderId: number,
  courierId: number
) {
  // Atomic update prevents two couriers from
  // accepting the same delivery.
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: "PENDING",
      courierId: null,
    },
    data: {
      courierId,
      status: "ASSIGNED",
    },
  });

  if (result.count !== 1) {
    throw new OrderNotAvailableError();
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // All couriers refresh their available orders.
  // The business sees the assigned courier.
  notifyOrderChanged(
    order.id,
    order.businessId,
    courierId,
    true
  );

  return order;
}

// =====================================================
// COURIER ORDERS
// =====================================================

export async function getCourierOrders(courierId: number) {
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  );

  return prisma.order.findMany({
    where: {
      courierId,
      createdAt: {
        gte: threeDaysAgo,
      },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// =====================================================
// PICK UP ORDER
// =====================================================

export async function pickupOrder(
  orderId: number,
  courierId: number
) {
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      courierId,
      status: "ASSIGNED",
    },
    data: {
      status: "PICKED_UP",
    },
  });

  if (result.count !== 1) {
    throw new InvalidOrderTransitionError();
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Notify the business and assigned courier.
  notifyOrderChanged(
    order.id,
    order.businessId,
    courierId
  );

  return order;
}

// =====================================================
// DELIVER ORDER
// =====================================================

export async function deliverOrder(
  orderId: number,
  courierId: number
) {
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      courierId,
      status: "PICKED_UP",
    },
    data: {
      status: "DELIVERED",
    },
  });

  if (result.count !== 1) {
    throw new InvalidOrderTransitionError();
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Notify the business and assigned courier.
  notifyOrderChanged(
    order.id,
    order.businessId,
    courierId
  );

  return order;
}

// =====================================================
// BUSINESS ORDERS
// =====================================================

export async function getBusinessOrders(businessId: number) {
  const threeDaysAgo = new Date(
    Date.now() - 3 * 24 * 60 * 60 * 1000
  );

  return prisma.order.findMany({
    where: {
      businessId,
      createdAt: {
        gte: threeDaysAgo,
      },
    },
    include: {
      courier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
