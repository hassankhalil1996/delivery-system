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
        <p>You will be able to create delivery orders here.</p>
      </main>
    </div>
  );
}