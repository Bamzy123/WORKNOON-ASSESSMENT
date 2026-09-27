import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { submitRefund } from "../api.js";

function RefundResult({ result }) {
  return (
    <section className={`result ${result.decision.toLowerCase()}`}>
      <small>DECISION</small>
      <h2>{result.decision}</h2>
      <b>{result.reason_code.replaceAll("_", " ")}</b>
      <p>{result.policy_reason}</p>
      <div className="audit">
        <b>Request category:</b> {result.classification.replaceAll("_", " ")}
        <br />
        <b>Assessment source:</b> {result.ai_source}
        <br />
        <b>Support note:</b> {result.ai_summary}
        <br />
        <b>Injection flag:</b>{" "}
        {result.injection_flag ? "Yes - human review" : "No"}
      </div>
    </section>
  );
}

export default function CustomerRequest() {
  const [orderNumber, setOrderNumber] = useState("ORD-1001");
  const [message, setMessage] = useState(
    "My headphones arrived broken and I would like a refund.",
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);
    try {
      setResult(await submitRefund(orderNumber, message));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="customer">
      <section className="hero">
        <h1>Submit a refund request</h1>
        <p>
          Tell us what happened and we will check your order against the refund policy.
        </p>
      </section>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="order-number">Order number</label>
        <input
          id="order-number"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
        />
        <label htmlFor="refund-message">What happened?</label>
        <textarea
          id="refund-message"
          rows="6"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="spinner" size={17} /> : <Send size={17} />}
          {isSubmitting ? "Checking..." : "Check refund eligibility"}
        </button>
        <small>Demo orders: ORD-1001 to ORD-1015</small>
        {error && <p className="error">{error}</p>}
        {result && <RefundResult result={result} />}
      </form>
    </main>
  );
}
