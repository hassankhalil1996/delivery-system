
export type DeliveryArea = "BUEINA" | "NUJEIDAT";

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  area: DeliveryArea;
  address: string;
  orderPrice: number;
  prepMinutes: number;
  notes?: string;
};

export type Order = CreateOrderInput & {
  id: number;
  businessId: number;
  deliveryFee: string;
  status: string;
  isReady: boolean;
  createdAt: string;
};

export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {
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



export type AvailableOrder = {
  id: number;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  orderPrice: string;
  prepMinutes: number;
  notes: string | null;
  status: "PENDING";
  isReady: boolean;
  createdAt: string;
  business: {
    id: number;
    name: string;
  };
};

export async function getAvailableOrders(): Promise<AvailableOrder[]> {
  const response = await fetch("/orders/available", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load available deliveries");
  }

  return response.json();
}
