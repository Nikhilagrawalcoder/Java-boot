# EnvSync

Environment configuration intelligence for SaaS teams. EnvSync answers one
question well: **can you safely deploy with the configuration you currently
have?**

It is not a secrets manager — it never stores actual secret values. It
detects which environment variables your app needs, where they exist, and
what's missing or exposed.

## Status: Phase 1 — Authentication, database, dashboard shell

This is the first of the project's build phases. What's here:

- Landing page (headline, feature overview, pricing tiers)
- Sign up / sign in with GitHub OAuth or email + password (Auth.js v5)
- Postgres schema (Prisma) modeling the full product: organizations,
  memberships/roles, repositories, scans, environments, environment
  variables, and issues
- Dashboard shell behind auth, with the "connect a repository" empty state

Not yet built (later phases, per the product spec): the repository scanner,
`.env.example` comparison, secret exposure detection, health scoring, issue
detail pages, the CLI, GitHub PR checks, and the AI Copilot.

## Getting started

```bash
cp .env.example .env
# fill in DATABASE_URL, NEXTAUTH_SECRET, and (optionally) GITHUB_ID/GITHUB_SECRET

docker compose up -d          # local Postgres
npm install
npm run db:push               # create tables from prisma/schema.prisma
npm run dev
```

Generate `NEXTAUTH_SECRET` with `npx auth secret` or `openssl rand -base64 32`.

GitHub OAuth is optional for local development — email/password sign-up works
without it. To enable "Continue with GitHub", create an OAuth App at
https://github.com/settings/developers with callback URL
`http://localhost:3000/api/auth/callback/github`, then set `GITHUB_ID` and
`GITHUB_SECRET`. See [docs/github-permissions.md](docs/github-permissions.md)
for exactly what access is requested and why.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth) v5

## Data model

See [`prisma/schema.prisma`](prisma/schema.prisma). Every model that could
touch a credential stores metadata only — key names, file/line usage,
booleans, masked previews — never a real secret value.
