
import { prisma } from "../../lib/prisma.js";

export async function getRestaurantOrders(
  businessId: number
) {
  return prisma.restaurantOrder.findMany({
    where: {
      businessId,
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
    include: {
      items: true,
    },
  });
}
