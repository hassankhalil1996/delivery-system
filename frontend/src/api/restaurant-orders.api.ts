
export type RestaurantOrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "REJECTED"
  | "CANCELED";

export type RestaurantOrderItem = {
  id: number;
  productId: string;
  productName: string;
  size: string | null;
  quantity: number;
  unitPrice: string;
  toppings: unknown;
  notes: string | null;
};

export type RestaurantOrder = {
  id: number;
  businessId: number;
  customerName: string;
  customerPhone: string;
  area: string;
  address: string;
  notes: string | null;
  status: RestaurantOrderStatus;
  foodTotal: string;
  prepMinutes: number | null;
  estimatedReadyAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: RestaurantOrderItem[];
};

const API_URL = import.meta.env.VITE_API_URL || "";

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.error || `Request failed: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export function getRestaurantOrders(): Promise<RestaurantOrder[]> {
  return apiRequest<RestaurantOrder[]>("/restaurant/orders");
}

export function acceptRestaurantOrder(
  orderId: number,
  prepMinutes: number
): Promise<RestaurantOrder> {
  return apiRequest<RestaurantOrder>(
    `/restaurant/orders/${orderId}/accept`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prepMinutes }),
    }
  );
}

export function startPreparingRestaurantOrder(
  orderId: number
): Promise<RestaurantOrder> {
  return apiRequest<RestaurantOrder>(
    `/restaurant/orders/${orderId}/preparing`,
    {
      method: "PATCH",
    }
  );
}

export function markRestaurantOrderReady(
  orderId: number
): Promise<RestaurantOrder> {
  return apiRequest<RestaurantOrder>(
    `/restaurant/orders/${orderId}/ready`,
    {
      method: "PATCH",
    }
  );
}

export function rejectRestaurantOrder(
  orderId: number
): Promise<RestaurantOrder> {
  return apiRequest<RestaurantOrder>(
    `/restaurant/orders/${orderId}/reject`,
    {
      method: "PATCH",
    }
  );
}
