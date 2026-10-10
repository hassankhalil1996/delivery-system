
import { prisma } from "../../lib/prisma.js";

export const AREAS = ["BUEINA", "NUJEIDAT"] as const;

export const PRICING_REASONS = [
  "NORMAL",
  "RAIN",
  "LATE_HOURS",
  "HIGH_DEMAND",
  "OTHER",
] as const;

export type Area = (typeof AREAS)[number];
export type PricingReason = (typeof PRICING_REASONS)[number];

export function isValidArea(value: unknown): value is Area {
  return AREAS.some((area) => area === value);
}

export function isValidReason(
  value: unknown
): value is PricingReason {
  return PRICING_REASONS.some((reason) => reason === value);
}

export async function getAllPricing() {
  return prisma.deliveryPricing.findMany({
    orderBy: { area: "asc" },
  });
}

export async function updatePricing(
  area: Area,
  fee: number,
  reason: PricingReason,
  reasonDetails: string | null
) {
  return prisma.deliveryPricing.upsert({
    where: { area },
    create: {
      area,
      fee,
      reason,
      reasonDetails,
    },
    update: {
      fee,
      reason,
      reasonDetails,
    },
  });
}
