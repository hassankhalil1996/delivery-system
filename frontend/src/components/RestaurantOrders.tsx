import { useCallback, useEffect, useState } from "react";
import {
  getRestaurantOrders,
  acceptRestaurantOrder,
  rejectRestaurantOrder,
  markRestaurantOrderReady,
  type RestaurantOrder,
} from "../api/restaurant-orders.api";
import "./RestaurantOrders.css";

type View = "ACTIVE" | "HISTORY";
const preparationOptions = [10, 15, 20, 30, 45, 60];
const isPreparing = (status: RestaurantOrder["status"]) =>
  status === "ACCEPTED" || status === "PREPARING";
const isHistory = (status: RestaurantOrder["status"]) =>
  status === "READY" || status === "REJECTED" || status === "CANCELED";

function formatArea(area: string) {
  if (area === "BUEINA") return "Bu'eina";
  if (area === "NUJEIDAT") return "Nujeidat";
  return area;
}
function formatSize(size: string | null) {
  return ({ small: "Small", family: "Family", giant: "Giant" } as Record<string, string>)[size ?? ""] ?? size ?? "";
}
function formatToppings(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.map((item: unknown) => {
    if (typeof item === "object" && item !== null && "id" in item && typeof item.id === "string") return item.id;
    return "";
  }).filter(Boolean).join(", ");
}
function timeAgo(date: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000));
  if (!Number.isFinite(minutes)) return "Time unavailable";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
}
function remainingLabel(order: RestaurantOrder, now: number) {
  const deadline = order.estimatedReadyAt ? new Date(order.estimatedReadyAt).getTime() : NaN;
  if (!Number.isFinite(deadline)) return order.prepMinutes === null ? "Preparing" : `${order.prepMinutes} min estimated`;
  const seconds = Math.ceil((deadline - now) / 1000);
  if (seconds <= 0) return "Estimated time passed";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} remaining`;
}

export default function RestaurantOrders() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [view, setView] = useState<View>("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [prepTimes, setPrepTimes] = useState<Record<number, number>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState(Date.now());

  const loadOrders = useCallback(async () => {
    const data = await getRestaurantOrders();
    setOrders(data);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    getRestaurantOrders().then((data) => {
      if (active) { setOrders(data); setError(""); }
    }).catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : "Failed to load orders");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Poll only while the dashboard is visible; actions still refresh immediately.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && busyOrderId === null) {
        void getRestaurantOrders().then(setOrders).catch(() => {
          // Keep the last known orders if a background refresh fails.
        });
      }
    }, 10000);
    return () => window.clearInterval(interval);
  }, [busyOrderId]);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try { await loadOrders(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to refresh orders"); }
    finally { setRefreshing(false); }
  }
  async function performAction(orderId: number, action: () => Promise<RestaurantOrder>, fallback: string) {
    setBusyOrderId(orderId);
    setError("");
    try { await action(); await loadOrders(); }
    catch (err) { setError(err instanceof Error ? err.message : fallback); }
    finally { setBusyOrderId(null); }
  }
  function handleAccept(orderId: number) {
    void performAction(orderId, () => acceptRestaurantOrder(orderId, prepTimes[orderId] ?? 20), "Failed to accept order");
  }
  function handleReject(orderId: number) {
    if (!window.confirm(`Reject order #${orderId}?`)) return;
    void performAction(orderId, () => rejectRestaurantOrder(orderId), "Failed to reject order");
  }
  function handleMarkReady(orderId: number) {
    if (!window.confirm(`Mark order #${orderId} as ready?`)) return;
    void performAction(orderId, () => markRestaurantOrderReady(orderId), "Failed to mark order ready");
  }

  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const preparingCount = orders.filter((order) => isPreparing(order.status)).length;
  const readyCount = orders.filter((order) => order.status === "READY").length;
  const historyCount = orders.filter((order) => isHistory(order.status)).length;
  const visibleOrders = orders.filter((order) => view === "ACTIVE" ? !isHistory(order.status) : isHistory(order.status))
    .sort((a, b) => {
      if (view === "ACTIVE") {
        const priority = (status: RestaurantOrder["status"]) => status === "PENDING" ? 0 : 1;
        if (priority(a.status) !== priority(b.status)) return priority(a.status) - priority(b.status);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <section className="restaurant-orders">
      <div className="restaurant-orders-heading">
        <div><h2>Online Orders</h2><p>Review new orders and manage preparation.</p></div>
        <button type="button" className="restaurant-refresh" onClick={() => void handleRefresh()} disabled={loading || refreshing}>
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>
      <div className="restaurant-summary" aria-label="Order summary">
        <div className="restaurant-summary-tile new"><span>New orders</span><strong>{pendingCount}</strong></div>
        <div className="restaurant-summary-tile cooking"><span>Preparing</span><strong>{preparingCount}</strong></div>
        <div className="restaurant-summary-tile done"><span>Ready</span><strong>{readyCount}</strong></div>
      </div>
      <div className="restaurant-orders-filters" role="group" aria-label="Order views">
        <button type="button" className={view === "ACTIVE" ? "active" : ""} aria-pressed={view === "ACTIVE"} onClick={() => setView("ACTIVE")}>Active orders ({pendingCount + preparingCount})</button>
        <button type="button" className={view === "HISTORY" ? "active" : ""} aria-pressed={view === "HISTORY"} onClick={() => setView("HISTORY")}>History ({historyCount})</button>
      </div>
      {error && <p className="restaurant-orders-error" role="alert">{error}</p>}
      {loading ? <p>Loading restaurant orders...</p> : visibleOrders.length === 0 ? (
        <p className="restaurant-orders-empty">{view === "ACTIVE" ? "No active orders right now." : "No order history yet."}</p>
      ) : (
        <div className="restaurant-orders-grid">
          {visibleOrders.map((order) => {
            const pending = order.status === "PENDING";
            const preparing = isPreparing(order.status);
            const showDetails = Boolean(expanded[order.id]);
            return (
              <article className={`restaurant-order-card ${pending ? "is-new" : ""}`} key={order.id}>
                <div className="restaurant-order-card-header">
                  <div><h3>Order #{order.id}</h3><small>{timeAgo(order.createdAt, now)}</small></div>
                  <span className={`restaurant-order-status status-${order.status.toLowerCase()}`}>
                    {pending ? "NEW ORDER" : preparing ? "PREPARING" : order.status}
                  </span>
                </div>
                <div className="restaurant-order-items">
                  {order.items.map((item) => (
                    <div className="restaurant-order-item" key={item.id}>
                      <div><strong>{item.quantity} × {item.productId}</strong>
                        {item.size && <p>Size: {formatSize(item.size)}</p>}
                        {formatToppings(item.toppings) && <p>Toppings: {formatToppings(item.toppings)}</p>}
                      </div>
                      <strong>₪{(Number(item.unitPrice) * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="restaurant-order-total"><span>Total</span><strong>₪{order.foodTotal}</strong></div>
                <div className="restaurant-order-customer">
                  <span><strong>{order.customerName}</strong> · {formatArea(order.area)}</span>
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [order.id]: !current[order.id] }))} aria-expanded={showDetails}>
                    {showDetails ? "Hide details" : "Customer details"}
                  </button>
                </div>
                {showDetails && (
                  <div className="restaurant-order-details">
                    <p><strong>Phone:</strong> <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></p>
                    <p><strong>Address:</strong> {order.address}</p>
                    {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                    <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                )}
                {preparing && <p className="restaurant-preparation-timer">◷ {remainingLabel(order, now)}</p>}
                {pending && (
                  <div className="restaurant-order-actions">
                    <label htmlFor={`prep-${order.id}`}>Preparation time</label>
                    <select id={`prep-${order.id}`} value={prepTimes[order.id] ?? 20} onChange={(event) => setPrepTimes((current) => ({ ...current, [order.id]: Number(event.target.value) }))} disabled={busyOrderId !== null}>
                      {preparationOptions.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                    </select>
                    <div className="restaurant-order-buttons">
                      <button type="button" className="accept" disabled={busyOrderId !== null} onClick={() => handleAccept(order.id)}>{busyOrderId === order.id ? "Processing..." : "Accept Order"}</button>
                      <button type="button" className="reject" disabled={busyOrderId !== null} onClick={() => handleReject(order.id)}>Reject</button>
                    </div>
                  </div>
                )}
                {preparing && (
                  <div className="restaurant-order-actions"><div className="restaurant-order-buttons">
                    <button type="button" className="accept" disabled={busyOrderId !== null} onClick={() => handleMarkReady(order.id)}>{busyOrderId === order.id ? "Processing..." : "✓ Mark Ready"}</button>
                  </div></div>
                )}
                {order.status === "READY" && <p className="restaurant-order-complete">✓ Order ready for pickup</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
