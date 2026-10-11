
import { prisma } from "../../lib/prisma.js";
import { isValidArea } from "../pricing/pricing.service.js";

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

export class PricingNotConfiguredError extends Error {
  constructor() {
    super("Delivery pricing is not configured for this area");
    this.name = "PricingNotConfiguredError";
  }
}

export async function createOrder(data: CreateOrderInput) {
  if (!isValidArea(data.area)) {
    throw new Error("Invalid delivery area");
  }

  return prisma.$transaction(async (tx) => {
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
}

export async function getAvailableOrders() {
  return prisma.order.findMany({
    where: {
      status: "PENDING",
      courierId: null,
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


export class OrderNotAvailableError extends Error {
  constructor() {
    super("This delivery is no longer available");
    this.name = "OrderNotAvailableError";
  }
}

export async function acceptOrder(
  orderId: number,
  courierId: number
) {
  // Atomic claim: only one courier can win.
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: "PENDING",
      courierId: null,
    },
    data: {
      courierId,
    },
  });

  if (result.count !== 1) {
    throw new OrderNotAvailableError();
  }

  return prisma.order.findUniqueOrThrow({
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
}

export async function getCourierOrders(courierId: number) {
  return prisma.order.findMany({
    where: {
      courierId,
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
