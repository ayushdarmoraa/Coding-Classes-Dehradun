// src/lib/pricing.ts
// Single source of truth for course prices.
// Prices provided by Ayush — do not change without explicit instruction.
export const PRICES = {
  FULL_STACK_GEN_AI: "₹25,000 (₹5,000/month)", // 6 months
  DATA_SCIENCE: "₹30,000 (₹6,000/month)",       // 6 months
  FULL_STACK: "₹6,000 (₹2,000/month)",          // 4 months
  // ✅ Updated per instruction:
  PYTHON: "₹12,000 (₹4,000/month)",             // 4 months
  JAVA:   "₹12,000 (₹4,000/month)",             // 4 months
} as const;

// Pricing display utilities
export interface PricingInfo {
  oneTime: number;
  monthly: number;
  duration: string;
  currency: string;
}

export function parsePricing(priceString: string, duration: string): PricingInfo {
  const match = priceString.match(/₹([\d,]+)\s*\(₹([\d,]+)\/month\)/);
  if (match) {
    return {
      oneTime: parseInt(match[1].replace(/,/g, '')),
      monthly: parseInt(match[2].replace(/,/g, '')),
      duration,
      currency: '₹'
    };
  }
  return {
    oneTime: 0,
    monthly: 0,
    duration,
    currency: '₹'
  };
}

