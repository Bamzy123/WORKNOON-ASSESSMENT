export const REFUND_WINDOW_DAYS = 30;
export const HUMAN_REVIEW_THRESHOLD = 500;

export function evaluatePolicy(order, classification, suspicious=false) {
  const daysOld = Math.max(0, Math.floor((Date.now() - new Date(order.ordered_at).getTime()) / 86400000));

  if (suspicious) return {
    decision:"ESCALATED", reasonCode:"SUSPICIOUS_REQUEST",
    reason:"The request contains suspicious or policy-bypass instructions and requires human review."
  };
  if (Boolean(order.final_sale)) return {
    decision:"DENIED", reasonCode:"FINAL_SALE",
    reason:"Final-sale items are not eligible for refunds."
  };
  if (daysOld > REFUND_WINDOW_DAYS) return {
    decision:"DENIED", reasonCode:"OUTSIDE_REFUND_WINDOW",
    reason:`The order is older than the ${REFUND_WINDOW_DAYS}-day refund window.`
  };
  if (order.amount > HUMAN_REVIEW_THRESHOLD) return {
    decision:"ESCALATED", reasonCode:"HIGH_VALUE",
    reason:`Refunds above $${HUMAN_REVIEW_THRESHOLD} require human review.`
  };
  if (["DAMAGED_ITEM","INCORRECT_ITEM"].includes(classification)) return {
    decision:"APPROVED", reasonCode:classification,
    reason:"Damaged or incorrect items within the refund window qualify for a refund."
  };
  return {
    decision:"ESCALATED", reasonCode:"NEEDS_REVIEW",
    reason:"The request does not match an automatic approval or denial rule and requires support review."
  };
}
