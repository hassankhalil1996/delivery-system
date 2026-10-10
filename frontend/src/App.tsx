import { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

import {
  getCurrentAdmin,
  logoutAdmin,
  type Admin,
} from "./api/auth.api";
import "./App.css";

function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkSession() {
    try {
      const user = await getCurrentAdmin();
      setAdmin(user);
      setError("");
    } catch {
      setError("Could not check your session.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void checkSession();
  }, []);

  async function handleLogout() {
    try {
      await logoutAdmin();
      setAdmin(null);
      setError("");
    } catch {
      setError("Logout failed. Please try again.");
    }
  }

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <>
      {error && <div role="alert" className="error-message">{error}</div>}

      {admin ? (
        <AdminDashboard
          username={admin.username}
          onLogout={() => void handleLogout()}
        />
      ) : (
        <AdminLogin onLogin={() => void checkSession()} />
      )}
    </>
  );
}

export default App;