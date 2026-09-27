import { useEffect, useState } from "react";
import { LoaderCircle, LogOut, RefreshCcw } from "lucide-react";
import { getDashboardData } from "../api.js";

const statNames = ["total", "approved", "denied", "escalated"];

export default function AdminDashboard({ credentials, onSignOut }) {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main>
      <div className="adminHead">
        <div>
          <h1>Refund requests</h1>
          <p>Review recent requests and the policy outcome for each one.</p>
        </div>
        <div className="adminActions">
          <button className="secondary" onClick={loadDashboard} disabled={isLoading}>
            {isLoading ? <LoaderCircle className="spinner" size={16} /> : <RefreshCcw size={16} />}
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          <button className="secondary" onClick={onSignOut}>
            <LogOut size={16} /> Sign out
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
              <th>Request category</th>
              <th>Decision</th>
              <th>Audit reason</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="table-status">
                  <LoaderCircle className="spinner" size={18} /> Loading refund requests...
                </td>
              </tr>
            ) : refunds.length ? (
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
                  <td>{refund.classification.replaceAll("_", " ")}</td>
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
