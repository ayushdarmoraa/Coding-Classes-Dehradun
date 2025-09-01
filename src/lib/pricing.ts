// src/lib/pricing.ts
// Single source of truth for course prices.
// Prices provided by Ayush — do not change without explicit instruction.
export const PRICES = {
  FULL_STACK_GEN_AI: "₹25,000 (₹5,000/month)", // 6 months
  DATA_SCIENCE: "₹30,000 (₹6,000/month)",       // 6 months
  FULL_STACK: "₹6,000 (₹2,000/month)",          // 4 months
  // Leave Python/Java unset until confirmed:
  PYTHON: "TBD",
  JAVA: "TBD",
} as const;
