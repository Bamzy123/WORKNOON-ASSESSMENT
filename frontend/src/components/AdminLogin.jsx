import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    onLogin({ username, password });
  }

  return (
    <main className="customer">
      <section className="hero">
        <span className="pill">
          <ShieldCheck size={16} /> Restricted area
        </span>
        <h1>Admin sign in</h1>
        <p>Enter the credentials configured for this demo environment.</p>
      </section>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button>
          <ShieldCheck size={17} /> Open admin dashboard
        </button>
      </form>
    </main>
  );
}
