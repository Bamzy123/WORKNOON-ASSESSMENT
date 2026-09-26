import { useEffect, useState } from "react";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { getDashboardData } from "../api.js";

const statNames = ["total", "approved", "denied", "escalated"];

export default function AdminDashboard({ credentials, onSignOut }) {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");
      const [recentRefunds, refundStats] = await getDashboardData(
        credentials.username,
        credentials.password,
      );
      setRefunds(recentRefunds);
      setStats(refundStats);
    } catch (requestError) {
      setRefunds([]);
      setStats({});
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadDashboard();
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
        <div className="adminActions">
          <button className="secondary" onClick={loadDashboard}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <div className="stats">
        {statNames.map((name) => (
          <div className="stat" key={name}>
            <span>{name}</span>
            <strong>{stats[name] || 0}</strong>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
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
            {refunds.length ? (
              refunds.map((refund) => (
                <tr key={refund.id}>
                  <td>#{refund.id}</td>
                  <td>
                    <b>{refund.customer}</b>
                    <br />
                    <span>
                      {refund.order_number} - {refund.item}
                    </span>
                  </td>
                  <td>${refund.amount.toFixed(2)}</td>
                  <td>{refund.classification}</td>
                  <td>
                    <span className={`badge ${refund.decision.toLowerCase()}`}>
                      {refund.decision}
                    </span>
                  </td>
                  <td>
                    {refund.policy_reason}
                    {refund.injection_flag && (
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
