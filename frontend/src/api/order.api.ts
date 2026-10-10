
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

  // Pricing is assigned by the backend
  deliveryFee: string;
  deliveryFeeReason: string;
  deliveryFeeReasonDetails: string | null;

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

  area: DeliveryArea;
  address: string;

  orderPrice: string;

  // Saved pricing for this specific order
  deliveryFee: string;
  deliveryFeeReason: string;
  deliveryFeeReasonDetails: string | null;

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load available deliveries"
    );
  }

  return data as AvailableOrder[];
}
