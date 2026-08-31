export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
}

// Ordered newest first. Each entry's `date` and `title` must match the
// corresponding page in src/app/blog/<slug>/page.tsx exactly — this list
// only drives the index page, it doesn't render post content.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-env-example-always-lies",
    title: "Why .env.example always lies",
    description:
      "It exists to document your configuration. In practice it drifts the moment someone adds a variable and forgets to update it — and nothing catches that until production.",
    date: "August 30, 2026",
  },
  {
    slug: "what-breaks-when-a-stripe-key-is-missing-in-staging",
    title: "What actually breaks when a Stripe key is missing in staging",
    description:
      "Not a crash. A 500 on checkout, three weeks after the variable quietly stopped being set — and a webhook that's been failing silently the whole time.",
    date: "August 29, 2026",
  },
  {
    slug: "secrets-manager-vs-configuration-validator",
    title: "A secrets manager and a configuration validator are not the same tool",
    description:
      "Vault and Doppler answer \"where is the value stored.\" They don't answer \"does staging have everything production has\" — that's a different job.",
    date: "August 29, 2026",
  },
  {
    slug: "introducing-envsync",
    title: "Introducing EnvSync",
    description:
      "A configuration health score you can put in a status update, built from a scanner that reads your source tree once and never touches a secret value.",
    date: "August 28, 2026",
  },
];
