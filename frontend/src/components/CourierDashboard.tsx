
import { useCallback, useEffect, useState } from "react";

import {
  getAvailableOrders,
  getMyDeliveries,
  acceptDelivery,
  type AvailableOrder,
  type CourierOrder,
} from "../api/order.api";

import DeliveryPrices, {
  formatPricingReason,
} from "./DeliveryPrices";

import "./CourierDashboard.css";

type CourierDashboardProps = {
  name: string;
  onLogout: () => void;
};

type DeliveryCardProps = {
  order: AvailableOrder | CourierOrder;
  onAccept?: (id: number) => void;
  accepting?: boolean;
};

function DeliveryCard({
  order,
  onAccept,
  accepting = false,
}: DeliveryCardProps) {
  const areaName =
    order.area === "BUEINA"
      ? "Bu'eina"
      : order.area === "NUJEIDAT"
        ? "Nujeidat"
        : order.area;

  return (
    <article className="delivery-card">
      <div className="delivery-card-header">
        <h4>Order #{order.id}</h4>
        <span className="delivery-status">
          {onAccept ? "AVAILABLE" : "ASSIGNED"}
        </span>
      </div>

      <div className="delivery-details">
        <p>
          <strong>Business:</strong> {order.business.name}
        </p>

        <p>
          <strong>Customer:</strong> {order.customerName}
        </p>

        <p>
          <strong>Phone:</strong> {order.customerPhone}
        </p>

        <p>
          <strong>Area:</strong> {areaName}
        </p>

        <p>
          <strong>Address:</strong> {order.address}
        </p>

        <p>
          <strong>Order Price:</strong> ₪{order.orderPrice}
        </p>

        <div className="courier-delivery-fee">
          <p>
            <strong>Delivery Fee:</strong>{" "}
            {order.deliveryFee != null
              ? `₪${order.deliveryFee}`
              : "Not available"}
          </p>

          <p>
            <strong>Pricing Reason:</strong>{" "}
            {order.deliveryFeeReason
              ? formatPricingReason(
                  order.deliveryFeeReason,
                  order.deliveryFeeReasonDetails
                )
              : "Not available"}
          </p>
        </div>

        <p>
          <strong>Preparation:</strong> {order.prepMinutes} min
        </p>

        {order.notes && (
          <p>
            <strong>Notes:</strong> {order.notes}
          </p>
        )}
      </div>

      {onAccept && (
        <button
          type="button"
          className="accept-delivery-button"
          disabled={accepting}
          onClick={() => onAccept(order.id)}
        >
          {accepting ? "Accepting..." : "Accept Delivery"}
        </button>
      )}
    </article>
  );
}

export default function CourierDashboard({
  name,
  onLogout,
}: CourierDashboardProps) {
  const [availableOrders, setAvailableOrders] = useState<
    AvailableOrder[]
  >([]);

  const [myOrders, setMyOrders] = useState<CourierOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    const [available, mine] = await Promise.all([
      getAvailableOrders(),
      getMyDeliveries(),
    ]);

    setAvailableOrders(available);
    setMyOrders(mine);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialOrders() {
      try {
        const [available, mine] = await Promise.all([
          getAvailableOrders(),
          getMyDeliveries(),
        ]);

        if (!active) return;

        setAvailableOrders(available);
        setMyOrders(mine);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load deliveries"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialOrders();

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh deliveries"
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAccept(orderId: number) {
    if (acceptingId !== null) return;

    setAcceptingId(orderId);
    setError("");
    setSuccess("");

    try {
      const accepted = await acceptDelivery(orderId);

      // Update the UI immediately after successful acceptance.
      setAvailableOrders((current) =>
        current.filter((order) => order.id !== orderId)
      );

      setMyOrders((current) =>
        current.some((order) => order.id === accepted.id)
          ? current
          : [accepted, ...current]
      );

      setSuccess(
        `Order #${orderId} has been assigned to you.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to accept delivery"
      );

      // Refresh because another courier may have accepted it.
      try {
        await loadOrders();
      } catch {
        // Keep the original acceptance error visible.
      }
    } finally {
      setAcceptingId(null);
    }
  }

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
        <p>View and manage your delivery orders.</p>

        <DeliveryPrices />

        {error && (
          <p className="courier-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="courier-success" role="status">
            {success}
          </p>
        )}

        <section className="available-orders">
          <div className="orders-heading">
            <h3>
              Available Deliveries ({availableOrders.length})
            </h3>

            <button
              type="button"
              className="refresh-button"
              onClick={() => void handleRefresh()}
              disabled={loading || refreshing || acceptingId !== null}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <p>Loading deliveries...</p>
          ) : availableOrders.length === 0 ? (
            <p>No available deliveries right now.</p>
          ) : (
            <div className="orders-grid">
              {availableOrders.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  onAccept={(id) => void handleAccept(id)}
                  accepting={acceptingId !== null}
                />
              ))}
            </div>
          )}
        </section>

        <section className="my-deliveries">
          <div className="orders-heading">
            <h3>My Deliveries ({myOrders.length})</h3>
          </div>

          {loading ? (
            <p>Loading assigned deliveries...</p>
          ) : myOrders.length === 0 ? (
            <p>You haven't accepted any deliveries yet.</p>
          ) : (
            <div className="orders-grid">
              {myOrders.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
