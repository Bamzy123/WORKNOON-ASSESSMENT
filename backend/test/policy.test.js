import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePolicy } from "../src/policy.js";


const order = (amount = 100, days = 2, final_sale = 0) => ({
  amount,
  final_sale,
  ordered_at: new Date(Date.now() - days * 86400000).toISOString(),
});

test("damaged item approved", () =>
  assert.equal(evaluatePolicy(order(), "DAMAGED_ITEM").decision, "APPROVED"));

test("final sale denied", () =>
  assert.equal(
    evaluatePolicy(order(100, 2, 1), "DAMAGED_ITEM").decision,
    "DENIED",
  ));

test("old order denied", () =>
  assert.equal(
    evaluatePolicy(order(100, 31), "DAMAGED_ITEM").decision,
    "DENIED",
  ));

test("high value escalated", () =>
  assert.equal(
    evaluatePolicy(order(700), "DAMAGED_ITEM").decision,
    "ESCALATED",
  ));
  
test("injection escalated", () =>
  assert.equal(
    evaluatePolicy(order(), "DAMAGED_ITEM", true).decision,
    "ESCALATED",
  ));
