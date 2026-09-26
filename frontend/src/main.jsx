import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bot,
  LayoutDashboard,
  RefreshCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { getDashboardData, submitRefund } from "./api.js";
import "./styles.css";


function Customer() {
  const [order, setOrder] = useState("ORD-1001"),
    [message, setMessage] = useState(
      "My headphones arrived broken and I would like a refund.",
    );
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      setData(await submitRefund(order, message));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="customer">
      <section className="hero">
        <span className="pill">
          <Bot size={16} /> AI-assisted support
        </span>
        <h1>Refunds, without the runaround.</h1>
        <p>
          Tell us what happened. We'll check your order against policy and give
          you a clear next step.
        </p>
      </section>
      <form className="card" onSubmit={submit}>
        <label>Order number</label>
        <input value={order} onChange={(e) => setOrder(e.target.value)} />
        <label>What happened?</label>
        <textarea
          rows="6"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button disabled={loading}>
          <Send size={17} />
          {loading ? "Checking..." : "Check refund eligibility"}
        </button>
        <small>Demo orders: ORD-1001 to ORD-1015</small>
        {error && <p className="error">{error}</p>}
        {data && (
          <section className={"result " + data.decision.toLowerCase()}>
            <small>DECISION</small>
            <h2>{data.decision}</h2>
            <b>{data.reason_code.replaceAll("_", " ")}</b>
            <p>{data.policy_reason}</p>
            <div className="audit">
              <b>AI classification:</b> {data.classification}
              <br />
              <b>AI source:</b> {data.ai_source}
              <br />
              <b>AI note:</b> {data.ai_summary}
              <br />
              <b>Injection flag:</b>{" "}
              {data.injection_flag ? "Yes — human review" : "No"}
            </div>
          </section>
        )}
      </form>
    </main>
  );
}


function Admin() {
  const [rows, setRows] = useState([]),
    [stats, setStats] = useState({});
  async function load() {
    try {
      const [refunds, dashboardStats] = await getDashboardData();
      setRows(refunds);
      setStats(dashboardStats);
    } catch {
      setRows([]);
      setStats({});
    }
  }
  useEffect(() => {
    load();
  }, []);


  return (
    <main>
      <div className="adminHead">
        <div>
          <span className="pill">
            <ShieldCheck size={16} /> Support operations
          </span>
          <h1>Refund review dashboard</h1>
          <p>Recent outcomes with policy reasoning and audit notes.</p>
        </div>
        <button className="secondary" onClick={load}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>
      <div className="stats">
        {["total", "approved", "denied", "escalated"].map((k) => (
          <div className="stat" key={k}>
            <span>{k}</span>
            <strong>{stats[k] || 0}</strong>
          </div>
        ))}
      </div>
      <div className="table card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer / order</th>
              <th>Amount</th>
              <th>AI classification</th>
              <th>Decision</th>
              <th>Audit reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>
                    <b>{r.customer}</b>
                    <br />
                    <span>
                      {r.order_number} · {r.item}
                    </span>
                  </td>
                  <td>${r.amount.toFixed(2)}</td>
                  <td>{r.classification}</td>
                  <td>
                    <span className={"badge " + r.decision.toLowerCase()}>
                      {r.decision}
                    </span>
                  </td>
                  <td>
                    {r.policy_reason}
                    {r.injection_flag && (
                      <>
                        <br />
                        <b>Injection flag</b>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No requests yet. Submit one from Customer.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}


function App() {
  const [p, setP] = useState("customer");

  
  return (
    <>
      <header>
        <div className="brand">
          <div className="logo">W</div>
          <div>
            <b>WORKNOON</b>
            <span>AI Refund Support</span>
          </div>
        </div>
        <nav>
          <button
            className={p === "customer" ? "active" : ""}
            onClick={() => setP("customer")}
          >
            <Bot size={17} /> Customer
          </button>
          <button
            className={p === "admin" ? "active" : ""}
            onClick={() => setP("admin")}
          >
            <LayoutDashboard size={17} /> Admin
          </button>
        </nav>
      </header>
      {p === "customer" ? <Customer /> : <Admin />}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
