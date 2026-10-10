import { useEffect, useState } from "react";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import BusinessDashboard from "./components/BusinessDashboard";

import {
  getCurrentUser,
  logout,
  type AuthUser,
} from "./api/auth.api";

import "./App.css";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkSession() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
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
      await logout();
      setUser(null);
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
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {!user ? (
        <AdminLogin onLogin={() => void checkSession()} />
      ) : user.role === "ADMIN" ? (
        <AdminDashboard
          username={user.username}
          onLogout={() => void handleLogout()}
        />
      ) : (
        <BusinessDashboard
          name={user.name}
          onLogout={() => void handleLogout()}
        />
      )}
    </>
  );
}

export default App;