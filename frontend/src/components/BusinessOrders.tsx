
import { useCallback, useEffect, useState } from "react";

import {
  getBusinessOrders,
  type BusinessOrder,
} from "../api/order.api";

import { formatPricingReason } from "./DeliveryPrices";

import "./BusinessOrders.css";

type OrderStatus = BusinessOrder["status"];
type StatusFilter = "ALL" | OrderStatus;

type BusinessOrdersProps = {
  refreshKey: number;
};

const statuses: OrderStatus[] = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
];

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatArea(area: string) {
  if (area === "BUEINA") return "Bu'eina";
  if (area === "NUJEIDAT") return "Nujeidat";
  return area;
}

export default function BusinessOrders({
  refreshKey,
}: BusinessOrdersProps) {
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    const data = await getBusinessOrders();
    setOrders(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      try {
        const data = await getBusinessOrders();

        if (active) {
          setOrders(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load orders"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    try {
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh orders"
      );
    } finally {
      setRefreshing(false);
    }
  }

  const counts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    ASSIGNED: orders.filter((o) => o.status === "ASSIGNED").length,
    PICKED_UP: orders.filter((o) => o.status === "PICKED_UP").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <section className="business-orders">
      <div className="business-orders-heading">
        <div>
          <h2>My Business Orders</h2>
          <p>Track your deliveries from creation to completion.</p>
        </div>

        <button
          type="button"
          className="business-orders-refresh"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="business-orders-stats">
        {statuses.map((status) => (
          <div className="business-orders-stat" key={status}>
            <span>{formatStatus(status)}</span>
            <strong>{counts[status]}</strong>
          </div>
        ))}
      </div>

      <div className="business-orders-filters">
        {(["ALL", ...statuses] as StatusFilter[]).map(
          (status) => (
            <button
              key={status}
              type="button"
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status === "ALL" ? "All" : formatStatus(status)}
              {" "}
              ({status === "ALL" ? orders.length : counts[status]})
            </button>
          )
        )}
      </div>

      {error && (
        <p className="business-orders-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="business-orders-empty">
          No orders found for this status.
        </p>
      ) : (
        <div className="business-orders-grid">
          {filteredOrders.map((order) => (
            <article className="business-order-card" key={order.id}>
              <div className="business-order-card-header">
                <h3>Order #{order.id}</h3>

                <span
                  className={`business-order-status status-${order.status.toLowerCase()}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="business-order-details">
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

                <p>
                  <strong>Order Price:</strong> ₪{order.orderPrice}
                </p>

                <p>
                  <strong>Delivery Fee:</strong> ₪{order.deliveryFee}
                </p>

                <p>
                  <strong>Pricing Reason:</strong>{" "}
                  {formatPricingReason(
                    order.deliveryFeeReason,
                    order.deliveryFeeReasonDetails
                  )}
                </p>

                <p>
                  <strong>Preparation:</strong> {order.prepMinutes} min
                </p>

                <p>
                  <strong>Courier:</strong>{" "}
                  {order.courier?.name ?? "Not assigned yet"}
                </p>

                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>

                {order.notes && (
                  <p>
                    <strong>Notes:</strong> {order.notes}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
