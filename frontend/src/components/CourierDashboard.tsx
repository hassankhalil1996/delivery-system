import { useCallback, useEffect, useState } from "react";

import {
  getAvailableOrders,
  getMyDeliveries,
  acceptDelivery,
  pickupDelivery,
  completeDelivery,
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
  onPickup?: (id: number) => void;
  onDeliver?: (id: number) => void;
  busy: boolean;
};

function DeliveryCard({
  order,
  onAccept,
  onPickup,
  onDeliver,
  busy,
}: DeliveryCardProps) {
  const areaName =
    order.area === "BUEINA"
      ? "Bu'eina"
      : order.area === "NUJEIDAT"
        ? "Nujeidat"
        : order.area;

  const isAvailable = onAccept !== undefined;

  return (
    <article className="delivery-card">
      <div className="delivery-card-header">
        <h4>Order #{order.id}</h4>

        <span
          className={`delivery-status status-${order.status.toLowerCase()}`}
        >
          {order.status.replaceAll("_", " ")}
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

      {isAvailable && (
        <button
          type="button"
          className="accept-delivery-button"
          disabled={busy}
          onClick={() => onAccept(order.id)}
        >
          {busy ? "Please wait..." : "Accept Delivery"}
        </button>
      )}

      {!isAvailable &&
        order.status === "ASSIGNED" &&
        onPickup && (
          <button
            type="button"
            className="pickup-delivery-button"
            disabled={busy}
            onClick={() => onPickup(order.id)}
          >
            {busy ? "Please wait..." : "Confirm Pickup"}
          </button>
        )}

      {!isAvailable &&
        order.status === "PICKED_UP" &&
        onDeliver && (
          <button
            type="button"
            className="complete-delivery-button"
            disabled={busy}
            onClick={() => onDeliver(order.id)}
          >
            {busy ? "Please wait..." : "Mark Delivered"}
          </button>
        )}

      {!isAvailable && order.status === "DELIVERED" && (
        <p className="delivery-completed">
          Delivery Completed
        </p>
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
  const [busyId, setBusyId] = useState<number | null>(null);

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
    if (busyId !== null || refreshing) return;

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
    if (busyId !== null || refreshing) return;

    setBusyId(orderId);
    setError("");
    setSuccess("");

    try {
      const accepted = await acceptDelivery(orderId);

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

      try {
        await loadOrders();
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handlePickup(orderId: number) {
    if (busyId !== null || refreshing) return;

    setBusyId(orderId);
    setError("");
    setSuccess("");

    try {
      const updated = await pickupDelivery(orderId);

      setMyOrders((current) =>
        current.map((order) =>
          order.id === orderId ? updated : order
        )
      );

      setSuccess(`Order #${orderId} picked up successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm pickup"
      );

      try {
        await loadOrders();
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeliver(orderId: number) {
    if (busyId !== null || refreshing) return;

    setBusyId(orderId);
    setError("");
    setSuccess("");

    try {
      const updated = await completeDelivery(orderId);

      setMyOrders((current) =>
        current.map((order) =>
          order.id === orderId ? updated : order
        )
      );

      setSuccess(`Order #${orderId} delivered successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete delivery"
      );

      try {
        await loadOrders();
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setBusyId(null);
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
              disabled={loading || refreshing || busyId !== null}
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
                  busy={busyId !== null || refreshing}
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
                  onPickup={(id) => void handlePickup(id)}
                  onDeliver={(id) => void handleDeliver(id)}
                  busy={busyId !== null || refreshing}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
