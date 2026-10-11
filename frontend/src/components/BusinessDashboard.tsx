
import { useState } from "react";

import OrderCreateForm from "./OrderCreateForm";
import DeliveryPrices from "./DeliveryPrices";
import BusinessOrders from "./BusinessOrders";

type BusinessDashboardProps = {
  name: string;
  onLogout: () => void;
};

export default function BusinessDashboard({
  name,
  onLogout,
}: BusinessDashboardProps) {
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  function handleOrderCreated() {
    setOrdersRefreshKey((current) => current + 1);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{name}</h1>

        <div className="header-actions">
          <span>Business Dashboard</span>

          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <h2>Welcome to {name}</h2>
        <p>Create and manage your delivery orders.</p>

        <DeliveryPrices />

        <OrderCreateForm onOrderCreated={handleOrderCreated} />

        <BusinessOrders refreshKey={ordersRefreshKey} />
      </main>
    </div>
  );
}
