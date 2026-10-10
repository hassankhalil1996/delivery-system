
export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  orderPrice: number;
  deliveryFee: number;
  prepMinutes: number;
  notes?: string;
};

export type Order = CreateOrderInput & {
  id: number;
  businessId: number;
  status: string;
  isReady: boolean;
  createdAt: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await fetch("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create order");
  }

  return data as Order;
}
