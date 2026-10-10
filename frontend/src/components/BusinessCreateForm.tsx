import { useState, type FormEvent } from "react";
import {
  createBusiness,
  type Business,
} from "../api/business.api";

export default function BusinessCreateForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdBusiness, setCreatedBusiness] =
    useState<Business | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setCreatedBusiness(null);

    try {
      const business = await createBusiness({
        name: name.trim(),
        username: username.trim(),
        password,
      });

      setCreatedBusiness(business);

      // Clear form after successful creation
      setName("");
      setUsername("");
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create business"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="business-form-card">
      <h3>Add New Business</h3>
      <p>Create a login account for a business.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="business-name">Business Name</label>
        <input
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Pizza Napoli"
          required
        />

        <label htmlFor="business-username">Username</label>
        <input
          id="business-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. napoli"
          required
        />

        <label htmlFor="business-password">Password</label>
        <input
          id="business-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Business"}
        </button>
      </form>

      {error && (
        <p className="business-error" role="alert">
          {error}
        </p>
      )}

      {createdBusiness && (
        <div className="business-success" role="status">
          Business "{createdBusiness.name}" created successfully!
          <p>
            Username: <strong>{createdBusiness.username}</strong>
          </p>
        </div>
      )}
    </section>
  );
}