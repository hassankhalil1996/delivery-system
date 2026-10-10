
import { useState, type FormEvent } from "react";
import { createOrder } from "../api/order.api";
import "./OrderCreateForm.css";

export default function OrderCreateForm() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        area: area.trim(),
        address: address.trim(),
        orderPrice: Number(orderPrice),
        deliveryFee: Number(deliveryFee),
        prepMinutes: Number(prepMinutes),
        notes: notes.trim() || undefined,
      });

      setSuccess(`Order #${order.id} created successfully!`);

      setCustomerName("");
      setCustomerPhone("");
      setArea("");
      setAddress("");
      setOrderPrice("");
      setDeliveryFee("");
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
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
            placeholder="Nazareth"
          />
        </label>

        <label>
          Delivery Address
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Street, building, apartment"
          />
        </label>

        <div className="order-form-row">
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
            Delivery Fee (₪)
            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              required
              placeholder="20"
            />
          </label>
        </div>

        <label>
          Preparation Time (minutes)
          <input
            type="number"
            min="0"
            step="1"
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(e.target.value)}
            required
            placeholder="25"
          />
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

        {error && <p className="order-error" role="alert">{error}</p>}
        {success && <p className="order-success" role="status">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Order..." : "Create Delivery Order"}
        </button>
      </form>
    </section>
  );
}
