
import { useState, type FormEvent } from "react";

import {
  login,
  logout,
  getCurrentUser,
} from "../api/auth.api";

import "./AdminLogin.css";

type LoginRole = "BUSINESS" | "COURIER" | "ADMIN";

type AdminLoginProps = {
  onLogin: () => void;
};

const roles: LoginRole[] = [
  "BUSINESS",
  "COURIER",
  "ADMIN",
];

function formatRole(role: LoginRole) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  // No role selected initially
  const [role, setRole] = useState<LoginRole | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectRole(nextRole: LoginRole) {
    setRole(nextRole);
    setUsername("");
    setPassword("");
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!role) {
      setError("Please select an account type.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(username, password);

      const user = await getCurrentUser();

      if (!user || user.role !== role) {
        await logout();

        setError(
          `This account is not a ${formatRole(role)} account.`
        );

        return;
      }

      onLogin();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="login-brand-icon">🏍️</div>
          <h1>Delivery System</h1>
          <p>Choose how you want to sign in</p>
        </div>

        <div className="login-role-grid">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              className={`login-role-option ${
                role === item ? "selected" : ""
              }`}
              aria-pressed={role === item}
              onClick={() => selectRole(item)}
              disabled={loading}
            >
              <span className="login-role-icon">
                {item === "BUSINESS"
                  ? "🏪"
                  : item === "COURIER"
                  ? "🛵"
                  : "🛡️"}
              </span>

              <span>{formatRole(item)}</span>

              {role === item && (
                <span className="login-role-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {role ? (
          <div className="login-fields">
            <div className="login-selected-role">
              Signing in as <strong>{formatRole(role)}</strong>
            </div>

            <label htmlFor="username">
              {formatRole(role)} Username
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder={`Enter ${formatRole(role).toLowerCase()} username`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : `Login as ${formatRole(role)}`}
            </button>
          </div>
        ) : (
          <div className="login-select-message">
            Select Business, Courier, or Admin to continue.
          </div>
        )}
      </form>
    </div>
  );
}
