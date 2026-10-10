
import { useEffect, useState } from "react";

import {
  getAvailableOrders,
  type AvailableOrder,
} from "../api/order.api";

import DeliveryPrices, {
  formatPricingReason,
} from "./DeliveryPrices";

import "./CourierDashboard.css";

type CourierDashboardProps = {
  name: string;
  onLogout: () => void;
};

export default function CourierDashboard({
  name,
  onLogout,
}: CourierDashboardProps) {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getAvailableOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load deliveries"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <div className="courier-dashboard">
      <header className="dashboard-header">
        <h1>Courier Dashboard</h1>

        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <h2>Welcome, {name}</h2>
        <p>View incoming delivery orders.</p>

        <DeliveryPrices />

        <section className="available-orders">
          <div className="orders-heading">
            <h3>Available Deliveries ({orders.length})</h3>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <p className="courier-error" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p>Loading deliveries...</p>
          ) : orders.length === 0 ? (
            <p>No available deliveries right now.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <article className="delivery-card" key={order.id}>
                  <div className="delivery-card-header">
                    <h4>Order #{order.id}</h4>

                    <span className="delivery-status">
                      {order.status}
                    </span>
                  </div>

                  <div className="delivery-details">
                    <p>
                      <strong>Business:</strong>{" "}
                      {order.business.name}
                    </p>

                    <p>
                      <strong>Customer:</strong>{" "}
                      {order.customerName}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {order.customerPhone}
                    </p>

                    <p>
                      <strong>Area:</strong>{" "}
                      {order.area === "BUEINA"
                        ? "Bu'eina"
                        : order.area === "NUJEIDAT"
                          ? "Nujeidat"
                          : order.area}
                    </p>

                    <p>
                      <strong>Address:</strong>{" "}
                      {order.address}
                    </p>

                    <p>
                      <strong>Order Price:</strong>{" "}
                      ₪{order.orderPrice}
                    </p>

                    <div className="courier-delivery-fee">
                      <p>
                        <strong>Delivery Fee:</strong>{" "}
                        {order.deliveryFee != null &&
                        Number(order.deliveryFee) > 0
                          ? `₪${order.deliveryFee}`
                          : "Not priced"}
                      </p>

                      <p>
                        <strong>Pricing Reason:</strong>{" "}
                        {order.deliveryFee != null &&
                        Number(order.deliveryFee) > 0 &&
                        order.deliveryFeeReason
                          ? formatPricingReason(
                              order.deliveryFeeReason,
                              order.deliveryFeeReasonDetails
                            )
                          : "Not available"}
                      </p>
                    </div>

                    <p>
                      <strong>Preparation:</strong>{" "}
                      {order.prepMinutes} min
                    </p>

                    {order.notes && (
                      <p>
                        <strong>Notes:</strong>{" "}
                        {order.notes}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
