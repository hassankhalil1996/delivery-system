
import { useCallback, useEffect, useState } from "react";

import {
  getRestaurantOrders,
  acceptRestaurantOrder,
  rejectRestaurantOrder,
  startPreparingRestaurantOrder,
  markRestaurantOrderReady,
  type RestaurantOrder,
  type RestaurantOrderStatus,
} from "../api/restaurant-orders.api";

import "./RestaurantOrders.css";

type Filter = "ALL" | RestaurantOrderStatus;

const statuses: RestaurantOrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "REJECTED",
  "CANCELED",
];

const preparationOptions = [10, 15, 20, 30, 45, 60];

function formatArea(area: string) {
  if (area === "BUEINA") return "Bu'eina";
  if (area === "NUJEIDAT") return "Nujeidat";
  return area;
}

function formatSize(size: string | null) {
  if (size === "small") return "Small";
  if (size === "family") return "Family";
  if (size === "giant") return "Giant";
  return size ?? "";
}

function formatToppings(value: unknown): string {
  if (!Array.isArray(value)) return "";

  return value
    .map((item: unknown) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string"
      ) {
        return item.id;
      }
      return "";
    })
    .filter(Boolean)
    .join(", ");
}

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [prepTimes, setPrepTimes] = useState<Record<number, number>>({});

  const loadOrders = useCallback(async () => {
    const data = await getRestaurantOrders();
    setOrders(data);
  }, []);

  useEffect(() => {
    let active = true;

    getRestaurantOrders()
      .then((data) => {
        if (active) {
          setOrders(data);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load orders"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    try {
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh orders"
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAccept(orderId: number) {
    const prepMinutes = prepTimes[orderId] ?? 20;

    setBusyOrderId(orderId);
    setError("");

    try {
      await acceptRestaurantOrder(orderId, prepMinutes);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept order"
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  async function handleReject(orderId: number) {
    if (!window.confirm(`Reject order #${orderId}?`)) return;

    setBusyOrderId(orderId);
    setError("");

    try {
      await rejectRestaurantOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject order"
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  async function handleStartPreparing(orderId: number) {
    setBusyOrderId(orderId);
    setError("");

    try {
      await startPreparingRestaurantOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start preparing order"
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  async function handleMarkReady(orderId: number) {
    if (!window.confirm(`Mark order #${orderId} as ready?`)) {
      return;
    }

    setBusyOrderId(orderId);
    setError("");

    try {
      await markRestaurantOrderReady(orderId);
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark order ready"
      );
    } finally {
      setBusyOrderId(null);
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });

  const filteredOrders =
    filter === "ALL"
      ? sortedOrders
      : sortedOrders.filter((order) => order.status === filter);

  return (
    <section className="restaurant-orders">
      <div className="restaurant-orders-heading">
        <div>
          <h2>Online Restaurant Orders</h2>
          <p>Manage orders placed through your restaurant website.</p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="restaurant-orders-filters">
        {(["ALL", ...statuses] as Filter[]).map((status) => {
          const count =
            status === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === status).length;

          return (
            <button
              key={status}
              type="button"
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <p className="restaurant-orders-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading restaurant orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No restaurant orders found.</p>
      ) : (
        <div className="restaurant-orders-grid">
          {filteredOrders.map((order) => (
            <article
              className="restaurant-order-card"
              key={order.id}
            >
              <div className="restaurant-order-card-header">
                <h3>Order #{order.id}</h3>

                <span
                  className={`restaurant-order-status status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="restaurant-order-details">
                <p>
                  <strong>Customer:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customerPhone}
                </p>
                <p>
                  <strong>Area:</strong> {formatArea(order.area)}
                </p>
                <p>
                  <strong>Address:</strong> {order.address}
                </p>

                {order.notes && (
                  <p>
                    <strong>Notes:</strong> {order.notes}
                  </p>
                )}

                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="restaurant-order-items">
                <h4>Ordered Items</h4>

                {order.items.map((item) => (
                  <div
                    className="restaurant-order-item"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {item.quantity} × {item.productId}
                      </strong>

                      {item.size && (
                        <p>Size: {formatSize(item.size)}</p>
                      )}

                      {formatToppings(item.toppings) && (
                        <p>
                          Toppings: {formatToppings(item.toppings)}
                        </p>
                      )}
                    </div>

                    <strong>
                      ₪{Number(item.unitPrice) * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="restaurant-order-total">
                <strong>Total</strong>
                <strong>₪{order.foodTotal}</strong>
              </div>

              {order.prepMinutes !== null && (
                <p>
                  <strong>Preparation:</strong>{" "}
                  {order.prepMinutes} min
                </p>
              )}

              {order.status === "PENDING" && (
                <div className="restaurant-order-actions">
                  <label>
                    Preparation time

                    <select
                      value={prepTimes[order.id] ?? 20}
                      onChange={(event) =>
                        setPrepTimes((current) => ({
                          ...current,
                          [order.id]: Number(event.target.value),
                        }))
                      }
                      disabled={busyOrderId !== null}
                    >
                      {preparationOptions.map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} minutes
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="restaurant-order-buttons">
                    <button
                      type="button"
                      className="accept"
                      disabled={busyOrderId !== null}
                      onClick={() =>
                        void handleAccept(order.id)
                      }
                    >
                      {busyOrderId === order.id
                        ? "Processing..."
                        : "Accept"}
                    </button>

                    <button
                      type="button"
                      className="reject"
                      disabled={busyOrderId !== null}
                      onClick={() =>
                        void handleReject(order.id)
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {order.status === "ACCEPTED" && (
                <div className="restaurant-order-actions">
                  <div className="restaurant-order-buttons">
                    <button
                      type="button"
                      className="accept"
                      disabled={busyOrderId !== null}
                      onClick={() =>
                        void handleStartPreparing(order.id)
                      }
                    >
                      {busyOrderId === order.id
                        ? "Processing..."
                        : "Start Preparing"}
                    </button>

                    <button
                      type="button"
                      disabled={busyOrderId !== null}
                      onClick={() =>
                        void handleMarkReady(order.id)
                      }
                    >
                      Mark Ready
                    </button>
                  </div>
                </div>
              )}

              {order.status === "PREPARING" && (
                <div className="restaurant-order-actions">
                  <div className="restaurant-order-buttons">
                    <button
                      type="button"
                      className="accept"
                      disabled={busyOrderId !== null}
                      onClick={() =>
                        void handleMarkReady(order.id)
                      }
                    >
                      {busyOrderId === order.id
                        ? "Processing..."
                        : "Mark Ready"}
                    </button>
                  </div>
                </div>
              )}

              {order.status === "READY" && (
                <p>
                  <strong>Order is ready for pickup.</strong>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
