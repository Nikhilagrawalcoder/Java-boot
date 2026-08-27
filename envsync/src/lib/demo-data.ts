// Static illustrative data for the landing-page preview only.
// This is never wired to a real scan — it exists purely to show a new
// visitor what EnvSync's output looks like (the "Acme SaaS" scenario).

export const demoRepository = {
  name: "acme-saas",
  healthScore: 82,
  critical: 2,
  warning: 3,
  healthy: 21,
  lastScan: "4 minutes ago",
  environments: [
    { name: "Local", healthy: 24, total: 24 },
    { name: "Staging", healthy: 21, total: 24 },
    { name: "Production", healthy: 24, total: 24 },
  ],
  findings: [
    { severity: "critical" as const, text: "Stripe secret detected in config/payment.js" },
    { severity: "warning" as const, text: "REDIS_URL missing in staging" },
    { severity: "warning" as const, text: "OLD_STRIPE_KEY appears unused" },
  ],
};
