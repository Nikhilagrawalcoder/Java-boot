# EnvSync

Environment configuration intelligence for SaaS teams. EnvSync answers one
question well: **can you safely deploy with the configuration you currently
have?**

It is not a secrets manager — it never stores actual secret values. It
detects which environment variables your app needs, where they exist, and
what's missing or exposed.

## What's built

- **Landing page** — headline, feature overview, Free/Pro/Team pricing.
- **Auth** — GitHub OAuth or email + password (Auth.js v5), least-privilege
  scopes (`read:user` at sign-in; `repo` requested only when you connect a
  repository).
- **GitHub connection + repository picker** — OAuth token encrypted at rest
  (AES-256-GCM); lists your repos and lets you pick one to scan.
- **Repository scanner** — detects `process.env.X`, `os.getenv(...)`,
  `os.environ[...]`, `import.meta.env.X`, classifies each variable
  (database, Supabase, Stripe, Redis, storage, auth, email, AI, URL), and
  records file/line usage. Never reads variable values.
- **`.env.example` intelligence** — flags variables used in code but
  undocumented, and variables documented but never used.
- **Secret exposure detection** — pattern-matches Stripe/AWS/GitHub keys and
  private key blocks, masks every finding (`sk_live_••••••••••••9X2A`), and
  never stores the real value.
- **Unused-variable detection** — flags a variable that was previously
  detected but no longer appears in the codebase.
- **Configuration Health Score** — a transparent 0–100 score with a visible
  `-20 Missing production variable` style breakdown.
- **Environment management** — manually map Local/Development/Staging/
  Production to your files, toggle which variables are configured where.
- **Dashboard** — health card, per-environment coverage, recent findings.
- **Issue detail pages** — severity, usage location, per-environment status,
  algorithmic "how to fix" instructions.
- **CLI** (`cli/`) — `envsync scan` / `envsync check`, runs entirely offline
  against your local filesystem using the same detection engine; `check`
  exits non-zero on critical issues, for CI.
- **GitHub Actions integration** — generates the `envsync check` workflow
  YAML from the dashboard.
- **PR checks** — a webhook (registered automatically when you connect a
  repo, if `GITHUB_WEBHOOK_SECRET` is set) comments on PRs that introduce an
  undocumented variable. Requires a real public deployment to receive
  GitHub's webhook calls.
- **EnvSync Copilot** — answers questions like "Why is staging failing?"
  using only your own stored scan/issue data. Rule-based, not an LLM call.
- **Plan limits** — Free/Pro/Team repository caps enforced server-side.

## Demo data

`npm run db:seed` seeds the "Acme SaaS" scenario from the product spec: 8
variables, Staging missing `REDIS_URL` and `STRIPE_WEBHOOK_SECRET`, one
exposed Stripe key, one unused legacy variable. Sign in at `/signin` with:

```
demo@envsync.dev / envsync-demo
```

## Getting started

```bash
cp .env.example .env
# fill in DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY, and (optionally)
# GITHUB_ID/GITHUB_SECRET/GITHUB_WEBHOOK_SECRET

docker compose up -d          # local Postgres
npm install
npm run db:push               # create tables from prisma/schema.prisma
npm run db:seed               # optional: load the Acme SaaS demo scenario
npm run dev
```

Generate `NEXTAUTH_SECRET` with `npx auth secret` (or `openssl rand -base64
32`), and `ENCRYPTION_KEY` with `openssl rand -base64 32`.

GitHub OAuth is optional for local development — email/password sign-up
works without it, and the demo scenario above doesn't need it either. To
enable "Continue with GitHub" and real repository scanning, create an OAuth
App at https://github.com/settings/developers with callback URL
`http://localhost:3000/api/auth/callback/github`, then set `GITHUB_ID` and
`GITHUB_SECRET`. See [docs/github-permissions.md](docs/github-permissions.md)
for exactly what access is requested and why.

## CLI

```bash
cd cli
npm install
npm run build
node dist/index.js check ..   # or wherever your project lives
```

See [cli/README.md](cli/README.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth) v5

## Data model

See [`prisma/schema.prisma`](prisma/schema.prisma). Every model that could
touch a credential stores metadata only — key names, file/line usage,
booleans, masked previews, an encrypted OAuth token — never a real secret
value.

## Known limitations

- The GitHub OAuth flow and live repository scanning need a real registered
  GitHub OAuth App (`GITHUB_ID`/`GITHUB_SECRET`) — untested in this build's
  sandbox, which has no outbound access to arbitrary GitHub repos. The
  scanning/detection engine itself is fully tested against fixture and demo
  data; only the GitHub API plumbing is unverified end-to-end.
- PR checks require a real public deployment for GitHub to deliver webhook
  events to.
- Billing is a placeholder — plan limits are enforced, but there's no real
  payment integration (per the MVP spec).
