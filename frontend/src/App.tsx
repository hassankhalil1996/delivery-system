import { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import "./App.css";

type Admin = {
  id: number;
  username: string;
  role: "ADMIN";
};

function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkSession() {
    try {
      const response = await fetch("/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setAdmin(null);
        return;
      }

      const data = await response.json();

      if (data.user?.role === "ADMIN") {
        setAdmin(data.user);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void checkSession();
  }, []);

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!admin) {
    return <AdminLogin onLogin={() => void checkSession()} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Delivery System</h1>
        <span>Admin Dashboard</span>
      </header>

      <main>
        <h2>Welcome, {admin.username}</h2>
        <p>You are successfully logged in as an administrator.</p>
      </main>
    </div>
  );
}

export default App;