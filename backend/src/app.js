import cors from "cors";
import express from "express";
import helmet from "helmet";
import { analyzeRequest } from "./ai.js";
import { db } from "./db.js";
import { evaluatePolicy } from "./policy.js";
import { detectPromptInjection } from "./security.js";

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

function findOrder(orderNumber) {
  return db.prepare(`SELECT o.*, c.name AS customer FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.order_number = ?`).get(orderNumber);
}

function validateRefundRequest(body) {
  const { order_number: orderNumber, message } = body ?? {};
  if (typeof orderNumber !== "string" || typeof message !== "string") return { error: "An order number and message are required." };

  const normalizedOrderNumber = orderNumber.trim().toUpperCase();
  const normalizedMessage = message.trim();
  if (!normalizedOrderNumber || normalizedMessage.length < 5 || normalizedMessage.length > 2000) {
    return { error: "Message must be between 5 and 2000 characters." };
  }

  return { normalizedOrderNumber, normalizedMessage };
}

function saveRefundRequest(orderId, message, analysis, policy, isSuspicious) {
  return db.prepare(`INSERT INTO refund_requests (order_id, customer_message, classification, decision, reason_code, policy_reason, ai_summary, injection_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    orderId, message, analysis.classification, policy.decision, policy.reasonCode,
    policy.reason, analysis.summary, Number(isSuspicious),
  );
}

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/health", (_request, response) => response.json({ status: "ok" }));

  app.get("/api/orders/:orderNumber", (request, response) => {
    const order = findOrder(request.params.orderNumber.trim().toUpperCase());
    if (!order) return response.status(404).json({ error: "Order not found" });
    return response.json(order);
  });

  app.post("/api/refunds", async (request, response, next) => {
    try {
      const validatedRequest = validateRefundRequest(request.body);
      if (validatedRequest.error) return response.status(400).json({ error: validatedRequest.error });

      const { normalizedOrderNumber, normalizedMessage } = validatedRequest;
      const order = findOrder(normalizedOrderNumber);
      if (!order) return response.status(404).json({ error: "Order not found" });

      const isSuspicious = detectPromptInjection(normalizedMessage);
      const analysis = await analyzeRequest(normalizedMessage);
      const policy = evaluatePolicy(order, analysis.classification, isSuspicious);
      const savedRequest = saveRefundRequest(order.id, normalizedMessage, analysis, policy, isSuspicious);

      return response.status(201).json({
        request_id: savedRequest.lastInsertRowid,
        decision: policy.decision,
        reason_code: policy.reasonCode,
        policy_reason: policy.reason,
        classification: analysis.classification,
        ai_summary: analysis.summary,
        ai_source: analysis.source,
        injection_flag: isSuspicious,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/refunds", (_request, response) => {
    const refunds = db.prepare(`SELECT r.*, o.order_number, o.item_name AS item, o.amount, c.name AS customer FROM refund_requests r JOIN orders o ON o.id = r.order_id JOIN customers c ON c.id = o.customer_id ORDER BY r.id DESC`).all()
      .map((refund) => ({ ...refund, injection_flag: Boolean(refund.injection_flag) }));
    response.json(refunds);
  });

  app.get("/api/admin/stats", (_request, response) => {
    const totals = { total: 0, approved: 0, denied: 0, escalated: 0 };
    const decisions = db.prepare("SELECT decision, COUNT(*) AS count FROM refund_requests GROUP BY decision").all();
    for (const { decision, count } of decisions) {
      totals.total += count;
      totals[decision.toLowerCase()] = count;
    }
    response.json(totals);
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && "body" in error) return response.status(400).json({ error: "Request body must be valid JSON." });
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  });

  return app;
}
