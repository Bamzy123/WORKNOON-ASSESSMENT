import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { authenticateAdmin } from "../api.js";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const normalizedUsername = username.trim();
      await authenticateAdmin(normalizedUsername, password);
      onLogin({ username: normalizedUsername, password });
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
        <div className="password-input">
          <input
            id="admin-password"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            title={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="spinner" size={17} /> : <LogIn size={17} />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
