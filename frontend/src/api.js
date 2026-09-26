const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const payload = await response.json();

  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

export function submitRefund(orderNumber, message) {
  return request("/api/refunds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_number: orderNumber, message }),
  });
}

export function getDashboardData() {
  return Promise.all([
    request("/api/admin/refunds"),
    request("/api/admin/stats"),
  ]);
}
