import { prisma } from "../../lib/prisma.js";

export interface CreateOrderInput {
  businessId: number;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  orderPrice: number;
  deliveryFee: number;
  prepMinutes: number;
  notes?: string;
}

export async function createOrder(data: CreateOrderInput) {
  return prisma.order.create({
    data: {
      businessId: data.businessId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      area: data.area,
      address: data.address,
      orderPrice: data.orderPrice,
      deliveryFee: data.deliveryFee,
      prepMinutes: data.prepMinutes,
      notes: data.notes,
    },
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
