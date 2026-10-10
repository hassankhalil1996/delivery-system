import "./CourierDashboard.css";

type CourierDashboardProps = {
  name: string;
  onLogout: () => void;
};

export default function CourierDashboard({
  name,
  onLogout,
}: CourierDashboardProps) {
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
        <p>You are logged in as a courier.</p>

        <section>
          <h3>Available Deliveries</h3>
          <p>No deliveries to display yet.</p>
        </section>
      </main>
    </div>
  );
}
