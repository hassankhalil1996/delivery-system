
import { useEffect, useState } from "react";
import {
  getPricing,
  type DeliveryPricing,
  type PricingReason,
} from "../api/pricing.api";

import "./DeliveryPrices.css";

const REASON_LABELS: Record<PricingReason, string> = {
  NORMAL: "Normal pricing",
  RAIN: "Rain",
  LATE_HOURS: "Late hours",
  HIGH_DEMAND: "High demand",
  OTHER: "Other",
};

export function formatPricingReason(
  reason: PricingReason | string,
  details?: string | null
) {
  if (reason === "OTHER" && details) {
    return details;
  }

  return REASON_LABELS[reason as PricingReason] ?? reason;
}

export default function DeliveryPrices() {
  const [pricing, setPricing] = useState<DeliveryPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPricing() {
    setLoading(true);
    setError("");

    try {
      setPricing(await getPricing());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load prices"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPricing();
  }, []);

  return (
    <section className="delivery-prices">
      <div className="delivery-prices-header">
        <h2>Current Delivery Prices</h2>
        <button type="button" onClick={() => void loadPricing()}>
          Refresh Prices
        </button>
      </div>

      {loading && <p>Loading prices...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <div className="delivery-prices-grid">
          {(["BUEINA", "NUJEIDAT"] as const).map((area) => {
            const item = pricing.find((p) => p.area === area);

            return (
              <div className="delivery-price-card" key={area}>
                <h3>
                  {area === "BUEINA" ? "Bu'eina" : "Nujeidat"}
                </h3>

                {item ? (
                  <>
                    <strong>₪{item.fee}</strong>
                    <p>
                      {formatPricingReason(
                        item.reason,
                        item.reasonDetails
                      )}
                    </p>
                  </>
                ) : (
                  <p>Price not configured</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
