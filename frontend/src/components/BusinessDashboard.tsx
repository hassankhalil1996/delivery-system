
import OrderCreateForm from "./OrderCreateForm";
import DeliveryPrices from "./DeliveryPrices";

type BusinessDashboardProps = {
  name: string;
  onLogout: () => void;
};

export default function BusinessDashboard({
  name,
  onLogout,
}: BusinessDashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{name}</h1>

        <div className="header-actions">
          <span>Business Dashboard</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        <h2>Welcome to {name}</h2>
        <p>Create and manage your delivery orders.</p>

        <DeliveryPrices />
        
        <OrderCreateForm />
      </main>
    </div>
  );
}
