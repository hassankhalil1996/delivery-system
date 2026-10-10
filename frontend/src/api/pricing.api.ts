
export type DeliveryArea = "BUEINA" | "NUJEIDAT";

export type PricingReason =
  | "NORMAL"
  | "RAIN"
  | "LATE_HOURS"
  | "HIGH_DEMAND"
  | "OTHER";

export type DeliveryPricing = {
  id: number;
  area: DeliveryArea;
  fee: string;
  reason: PricingReason;
  reasonDetails: string | null;
  updatedAt: string;
};

export type UpdatePricingInput = {
  fee: number;
  reason: PricingReason;
  reasonDetails: string | null;
};

export async function getPricing(): Promise<DeliveryPricing[]> {
  const response = await fetch("/pricing", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load delivery pricing");
  }

  return response.json();
}

export async function updatePricing(
  area: DeliveryArea,
  input: UpdatePricingInput
): Promise<DeliveryPricing> {
  const response = await fetch(`/pricing/${area}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update pricing");
  }

  return data;
}
