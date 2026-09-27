import { useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { authenticateAdmin } from "../api.js";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authenticateAdmin(username, password);
      onLogin({ username, password });
    } catch (requestError) {
      setError("The username or password is incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="customer">
      <section className="hero">
        <h1>Admin sign in</h1>
        <p>Enter your support-team credentials to review refund requests.</p>
      </section>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="spinner" size={17} /> : <LogIn size={17} />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
