import BusinessCreateForm from "./BusinessCreateForm";
import CourierCreateForm from "./CourierCreateForm";
import DeliveryPricingForm from "./DeliveryPricingForm";

type AdminDashboardProps = {
  username: string;
  onLogout: () => void;
};

export default function AdminDashboard({
  username,
  onLogout,
}: AdminDashboardProps) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Delivery System</h1>

        <div className="header-actions">
          <span>Admin Dashboard</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main>
        <h2>Welcome, {username}</h2>
        <p>You are successfully logged in as an administrator.</p>

        <BusinessCreateForm />

        <CourierCreateForm />

        <DeliveryPricingForm />
      </main>
    </div>
  );
}