
import { useEffect, useState, type FormEvent } from "react";

import {
  getPricing,
  updatePricing,
  type DeliveryArea,
  type PricingReason,
} from "../api/pricing.api";

import "./DeliveryPricingForm.css";

const AREAS: { id: DeliveryArea; name: string }[] = [
  { id: "BUEINA", name: "Bu'eina" },
  { id: "NUJEIDAT", name: "Nujeidat" },
];

const REASONS: { id: PricingReason; name: string }[] = [
  { id: "NORMAL", name: "Normal pricing" },
  { id: "RAIN", name: "Rain" },
  { id: "LATE_HOURS", name: "Late hours" },
  { id: "HIGH_DEMAND", name: "High demand" },
  { id: "OTHER", name: "Other" },
];

type PricingFormState = {
  fee: string;
  reason: PricingReason;
  reasonDetails: string;
};

const EMPTY_FORM: PricingFormState = {
  fee: "",
  reason: "NORMAL",
  reasonDetails: "",
};

export default function DeliveryPricingForm() {
  const [forms, setForms] = useState<
    Record<DeliveryArea, PricingFormState>
  >({
    BUEINA: { ...EMPTY_FORM },
    NUJEIDAT: { ...EMPTY_FORM },
  });

  const [loading, setLoading] = useState(true);
  const [savingArea, setSavingArea] =
    useState<DeliveryArea | null>(null);

  const [error, setError] = useState("");
  const [messages, setMessages] = useState<
    Partial<Record<DeliveryArea, string>>
  >({});

  useEffect(() => {
    async function loadPricing() {
      try {
        const pricing = await getPricing();

        setForms((previous) => {
          const updated = { ...previous };

          for (const item of pricing) {
            if (item.area === "BUEINA" || item.area === "NUJEIDAT") {
              updated[item.area] = {
                fee: item.fee,
                reason: item.reason,
                reasonDetails: item.reasonDetails ?? "",
              };
            }
          }

          return updated;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load pricing"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPricing();
  }, []);

  function updateField(
    area: DeliveryArea,
    changes: Partial<PricingFormState>
  ) {
    setForms((previous) => ({
      ...previous,
      [area]: {
        ...previous[area],
        ...changes,
      },
    }));

    setMessages((previous) => ({
      ...previous,
      [area]: "",
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    area: DeliveryArea
  ) {
    event.preventDefault();

    const form = forms[area];
    const fee = Number(form.fee);

    if (
      form.fee.trim() === "" ||
      !Number.isFinite(fee) ||
      fee < 0 ||
      !Number.isInteger(Math.round(fee * 100) - fee * 100)
    ) {
      setMessages((previous) => ({
        ...previous,
        [area]: "Enter a valid fee with up to 2 decimal places.",
      }));
      return;
    }

    if (
      form.reason === "OTHER" &&
      !form.reasonDetails.trim()
    ) {
      setMessages((previous) => ({
        ...previous,
        [area]: "Please enter a reason.",
      }));
      return;
    }

    setSavingArea(area);
    setError("");

    try {
      const updated = await updatePricing(area, {
        fee,
        reason: form.reason,
        reasonDetails:
          form.reason === "OTHER"
            ? form.reasonDetails.trim()
            : null,
      });

      setForms((previous) => ({
        ...previous,
        [area]: {
          fee: updated.fee,
          reason: updated.reason,
          reasonDetails: updated.reasonDetails ?? "",
        },
      }));

      setMessages((previous) => ({
        ...previous,
        [area]: "Price saved successfully!",
      }));
    } catch (err) {
      setMessages((previous) => ({
        ...previous,
        [area]:
          err instanceof Error ? err.message : "Failed to save price",
      }));
    } finally {
      setSavingArea(null);
    }
  }

  return (
    <section className="delivery-pricing-section">
      <h2>Delivery Pricing</h2>
      <p>Configure delivery fees and the reason for each price.</p>

      {error && <p role="alert" className="pricing-error">{error}</p>}

      {loading ? (
        <p>Loading delivery pricing...</p>
      ) : (
        <div className="pricing-grid">
          {AREAS.map((area) => {
            const form = forms[area.id];

            return (
              <form
                key={area.id}
                className="pricing-card"
                onSubmit={(event) =>
                  void handleSubmit(event, area.id)
                }
              >
                <h3>{area.name}</h3>

                <label>
                  Delivery Fee (₪)
                  <input
                    type="number"
                    min="0"
                    max="99999999"
                    step="0.01"
                    required
                    value={form.fee}
                    onChange={(event) =>
                      updateField(area.id, {
                        fee: event.target.value,
                      })
                    }
                    placeholder="e.g. 15"
                  />
                </label>

                <label>
                  Reason
                  <select
                    value={form.reason}
                    onChange={(event) =>
                      updateField(area.id, {
                        reason: event.target.value as PricingReason,
                      })
                    }
                  >
                    {REASONS.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.name}
                      </option>
                    ))}
                  </select>
                </label>

                {form.reason === "OTHER" && (
                  <label>
                    Explanation
                    <textarea
                      value={form.reasonDetails}
                      maxLength={250}
                      required
                      onChange={(event) =>
                        updateField(area.id, {
                          reasonDetails: event.target.value,
                        })
                      }
                      placeholder="Explain the price change..."
                      rows={3}
                    />
                  </label>
                )}

                {messages[area.id] && (
                  <p role="status" className="pricing-message">
                    {messages[area.id]}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingArea !== null}
                >
                  {savingArea === area.id
                    ? "Saving..."
                    : "Save Price"}
                </button>
              </form>
            );
          })}
        </div>
      )}
    </section>
  );
}
