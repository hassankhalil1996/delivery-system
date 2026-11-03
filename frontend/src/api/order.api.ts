
const API_URL = import.meta.env.VITE_API_URL || "";

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
  deliveryFeeReason: string;
  deliveryFeeReasonDetails: string | null;
  status: string;
  isReady: boolean;
  createdAt: string;
};

export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  deliveryFee: string;
  deliveryFeeReason: string;
  deliveryFeeReasonDetails: string | null;
  prepMinutes: number;
  notes: string | null;
  status: string;
  isReady: boolean;
  createdAt: string;
  business: {
    id: number;
    name: string;
  };
};

export type CourierOrder = AvailableOrder & {
  courierId: number;
  businessId: number;
};

async function readOrderResponse<T>(
  response: Response,
  fallbackError: string
): Promise<T> {
  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : fallbackError;

    throw new Error(message);
  }

  return data as T;
}

export async function getAvailableOrders(): Promise<AvailableOrder[]> {
  const response = await fetch(`${API_URL}/orders/available`, {
    credentials: "include",
  });

  return readOrderResponse<AvailableOrder[]>(
    response,
    "Failed to load available deliveries"
  );
}

export async function acceptDelivery(
  orderId: number
): Promise<CourierOrder> {
  const response = await fetch(`${API_URL}/orders/${orderId}/accept`, {
    method: "PATCH",
    credentials: "include",
  });

  return readOrderResponse<CourierOrder>(
    response,
    "Failed to accept delivery"
  );
}

export async function getMyDeliveries(): Promise<CourierOrder[]> {
  const response = await fetch(`${API_URL}/orders/mine`, {
    credentials: "include",
  });

  return readOrderResponse<CourierOrder[]>(
    response,
    "Failed to load my deliveries"
  );
}

export async function pickupDelivery(
  orderId: number
): Promise<CourierOrder> {
  const response = await fetch(`${API_URL}/orders/${orderId}/pickup`, {
    method: "PATCH",
    credentials: "include",
  });

  return readOrderResponse<CourierOrder>(
    response,
    "Failed to confirm pickup"
  );
}

export async function completeDelivery(
  orderId: number
): Promise<CourierOrder> {
  const response = await fetch(`${API_URL}/orders/${orderId}/deliver`, {
    method: "PATCH",
    credentials: "include",
  });

  return readOrderResponse<CourierOrder>(
    response,
    "Failed to complete delivery"
  );
}

export type BusinessOrder = {
  id: number;
  businessId: number;
  courierId: number | null;
  customerName: string;
  customerPhone: string;
  area: DeliveryArea;
  address: string;
  orderPrice: string;
  deliveryFee: string;
  deliveryFeeReason: string;
  deliveryFeeReasonDetails: string | null;
  prepMinutes: number;
  notes: string | null;
  status: "PENDING" | "ASSIGNED" | "PICKED_UP" | "DELIVERED";
  isReady: boolean;
  createdAt: string;
  updatedAt: string;
  courier: {
    id: number;
    name: string;
  } | null;
};

export async function getBusinessOrders(): Promise<BusinessOrder[]> {
  const response = await fetch(`${API_URL}/orders/business/mine`, {
    credentials: "include",
  });

  return readOrderResponse<BusinessOrder[]>(
    response,
    "Failed to load business orders"
  );
}
