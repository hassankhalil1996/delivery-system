
import { useState, type FormEvent } from "react";
import { createCourier } from "../api/courier.api";

export default function CourierCreateForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const courier = await createCourier({
        name: name.trim(),
        username: username.trim(),
        password,
      });

      setSuccess(`Courier "${courier.name}" created successfully!`);

      setName("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create courier"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="business-form-card">
      <h2>Add New Courier</h2>
      <p>Create a login account for a delivery driver.</p>

      <form onSubmit={handleSubmit} className="business-form">
        <label>
          Courier Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ahmad"
            required
          />
        </label>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. courier1"
            autoComplete="off"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>

        {error && (
          <p className="order-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="order-success" role="status">
            {success}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Courier..." : "Create Courier"}
        </button>
      </form>
    </section>
  );
}
