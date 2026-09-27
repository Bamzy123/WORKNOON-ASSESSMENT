import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, LogOut, RefreshCcw } from "lucide-react";
import { getDashboardData } from "../api.js";

const statNames = ["total", "approved", "denied", "escalated"];
const pageSize = 5;

export default function AdminDashboard({ credentials, onSignOut }) {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
      setCurrentPage(1);
    } catch (requestError) {
      setRefunds([]);
      setStats({});
      setError(requestError.message);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading && !hasLoaded) {
    return (
      <main className="dashboard-loading" aria-live="polite">
        <LoaderCircle className="spinner" size={28} />
        <p>Loading refund requests...</p>
      </main>
    );
  }

  const pageCount = Math.max(1, Math.ceil(refunds.length / pageSize));
  const firstItemIndex = (currentPage - 1) * pageSize;
  const visibleRefunds = refunds.slice(firstItemIndex, firstItemIndex + pageSize);

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
            ) : visibleRefunds.length ? (
              visibleRefunds.map((refund) => (
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
      {refunds.length > pageSize && (
        <div className="pagination" aria-label="Refund request pagination">
          <span>
            Showing {firstItemIndex + 1}-{Math.min(firstItemIndex + pageSize, refunds.length)} of {refunds.length}
          </span>
          <div>
            <button
              className="secondary"
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span>Page {currentPage} of {pageCount}</span>
            <button
              className="secondary"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage === pageCount}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
