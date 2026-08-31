// Every plan gets the full product — scanning, health score, secret
// detection, .env.example intelligence, CLI, PR checks, live Vercel sync,
// Copilot, and the REST API/SDK are not gated by plan anywhere in the
// codebase (see PLAN_LIMITS/MEMBER_LIMITS/API_KEY_LIMITS in src/lib/plan.ts
// — those three are the only real, enforced differences). Plans are priced
// on scale, not features, so this data intentionally doesn't claim
// feature gates that don't exist in the product.

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "The full product, for one repository.",
    features: [
      "1 repository",
      "1 team seat",
      "1 API key",
      "Full scanning, health score & secret detection",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For teams shipping to staging and production.",
    features: ["5 repositories", "1 team seat", "3 API keys", "Everything in Free"],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For organizations with multiple engineers.",
    features: ["Unlimited repositories", "Unlimited team seats", "Unlimited API keys", "Everything in Pro"],
    cta: "Start Team",
    highlighted: false,
  },
];

export interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
  team: string;
}

// Only rows with a real, code-enforced difference between plans, plus the
// feature rows shown as identical across all three so it's clear nothing
// else is being held back.
export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Repositories", free: "1", pro: "5", team: "Unlimited" },
  { label: "Team seats", free: "1", pro: "1", team: "Unlimited" },
  { label: "Active API keys", free: "1", pro: "3", team: "Unlimited" },
  { label: "Configuration Health score", free: "✓", pro: "✓", team: "✓" },
  { label: "Secret exposure detection", free: "✓", pro: "✓", team: "✓" },
  { label: ".env.example intelligence", free: "✓", pro: "✓", team: "✓" },
  { label: "Offline CLI (envsync check)", free: "✓", pro: "✓", team: "✓" },
  { label: "GitHub Actions PR checks", free: "✓", pro: "✓", team: "✓" },
  { label: "Live Vercel sync", free: "✓", pro: "✓", team: "✓" },
  { label: "EnvSync Copilot", free: "✓", pro: "✓", team: "✓" },
  { label: "Public REST API + SDK", free: "✓", pro: "✓", team: "✓" },
];
