
import { useEffect, useState, type FormEvent } from "react";

import {
  createOrder,
  type DeliveryArea,
} from "../api/order.api";

import {
  getPricing,
  type DeliveryPricing,
} from "../api/pricing.api";

import { formatPricingReason } from "./DeliveryPrices";

import "./OrderCreateForm.css";

type OrderCreateFormProps = {
  onOrderCreated?: () => void;
};

export default function OrderCreateForm({
  onOrderCreated,
}: OrderCreateFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [area, setArea] = useState<DeliveryArea | "">("");
  const [address, setAddress] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const [pricing, setPricing] = useState<DeliveryPricing[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPricing() {
    setPricingLoading(true);
    setPricingError("");

    try {
      const data = await getPricing();
      setPricing(data);
    } catch (err) {
      setPricingError(
        err instanceof Error
          ? err.message
          : "Could not load delivery prices"
      );
    } finally {
      setPricingLoading(false);
    }
  }

  useEffect(() => {
    void loadPricing();
  }, []);

  const selectedPricing = pricing.find(
    (item) => item.area === area
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!area) {
      setError("Please select a delivery area.");
      return;
    }

    if (!selectedPricing) {
      setError("Delivery pricing is unavailable for this area.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        area,
        address: address.trim(),
        orderPrice: Number(orderPrice),
        prepMinutes: Number(prepMinutes),
        notes: notes.trim() || undefined,
      });

      setSuccess(
        `Order #${order.id} created successfully! Delivery fee: ₪${order.deliveryFee}`
      );

      // Notify the dashboard to refresh Business Orders
      onOrderCreated?.();

      setCustomerName("");
      setCustomerPhone("");
      setArea("");
      setAddress("");
      setOrderPrice("");
      setPrepMinutes("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="order-form-card">
      <h2>New Delivery Order</h2>
      <p>Enter the customer's delivery details.</p>

      <form onSubmit={handleSubmit} className="order-form">
        <label>
          Customer Name
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            placeholder="Ahmad"
          />
        </label>

        <label>
          Customer Phone
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            placeholder="0501234567"
          />
        </label>

        <label>
          Delivery Area
          <select
            value={area}
            onChange={(e) =>
              setArea(e.target.value as DeliveryArea | "")
            }
            required
          >
            <option value="">Select delivery area</option>
            <option value="BUEINA">Bu'eina</option>
            <option value="NUJEIDAT">Nujeidat</option>
          </select>
        </label>

        {area && (
          <div className="selected-delivery-price">
            {pricingLoading ? (
              <p>Loading delivery fee...</p>
            ) : selectedPricing ? (
              <>
                <strong>
                  Delivery Fee: ₪{selectedPricing.fee}
                </strong>

                <p>
                  Reason:{" "}
                  {formatPricingReason(
                    selectedPricing.reason,
                    selectedPricing.reasonDetails
                  )}
                </p>

                <small>
                  Fee is set by Admin and applied automatically.
                </small>
              </>
            ) : (
              <p>
                {pricingError ||
                  "Delivery price is not configured for this area."}
              </p>
            )}
          </div>
        )}

        <label>
          Delivery Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Street, building, apartment"
          />
        </label>

        <label>
          Order Price (₪)
          <input
            type="number"
            min="0"
            step="0.01"
            value={orderPrice}
            onChange={(e) => setOrderPrice(e.target.value)}
            required
            placeholder="80"
          />
        </label>

        <label>
          Preparation Time (minutes)
          <select
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(e.target.value)}
            required
          >
            <option value="">Select preparation time</option>

            {Array.from(
              { length: 12 },
              (_, index) => (index + 1) * 5
            ).map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutes
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Delivery instructions..."
          />
        </label>

        {error && (
          <p className="order-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="order-success" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || pricingLoading || !selectedPricing}
        >
          {loading ? "Creating Order..." : "Create Delivery Order"}
        </button>
      </form>
    </section>
  );
}
