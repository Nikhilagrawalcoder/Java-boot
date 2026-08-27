# EnvSync — Setup Guide

This walks you through running EnvSync locally, then turning on GitHub
integration and deploying it for real. Follow it top to bottom the first
time; after that, jump to whichever section you need.

---

## 0. What you need before starting

| Thing | Why | Where to get it |
|---|---|---|
| Node.js 18+ | Runs the app and the CLI | https://nodejs.org |
| A Postgres database | Stores everything (see §11 for what) | Docker (included), or a hosted one — Neon, Supabase, Railway, Vercel Postgres all work |
| A GitHub account | To create the OAuth App (§4) | — |
| (Optional) Docker | Easiest way to run Postgres locally | https://docker.com |

You do **not** need the GitHub OAuth App to explore the product — §1–3 get
you a fully working, fully populated dashboard with zero GitHub setup.

---

## 1. Install and configure

```bash
cd envsync
cp .env.example .env
npm install
```

Open `.env` and fill in these two values now (leave the GitHub ones blank
for the moment):

```bash
# Generate a random 32-byte secret for each of these two — run this twice:
openssl rand -base64 32
```

Paste one result into `NEXTAUTH_SECRET`, the other into `ENCRYPTION_KEY`.
`DATABASE_URL` and `NEXTAUTH_URL` can stay as the defaults for local dev.

---

## 2. Start Postgres and create the schema

**Option A — Docker (simplest):**

```bash
docker compose up -d
```

**Option B — a hosted Postgres you already have:** just paste its
connection string into `DATABASE_URL` in `.env` instead, and skip the
`docker compose` step.

Either way, then create the tables:

```bash
npm run db:push
```

---

## 3. Run it, with realistic demo data

```bash
npm run db:seed    # loads the "Acme SaaS" demo scenario
npm run dev
```

Open **http://localhost:3000**, click **Connect GitHub — Free** (or go
straight to `/signin`), and sign in with:

```
demo@envsync.dev / envsync-demo
```

You should land on a dashboard showing:
- Configuration Health **63/100**, with a visible score breakdown
- **Local 7/7 ✓**, **Staging 5/7 ⚠️**, **Production 7/7 ✓**
- Findings: an exposed Stripe key, two missing staging variables, one
  unused legacy variable
- Click any finding to see its issue detail page with fix instructions
- Try the **Copilot** tab: ask "Why is staging failing?" or "What changed?"

This is the whole product, working, before you touch GitHub at all.

---

## 4. Turn on real GitHub sign-in and scanning

You need a GitHub OAuth App. **Create two of them** — GitHub OAuth Apps
only accept a single callback URL each, so one is for local dev and one is
for your production domain (§10 below covers the second one).

1. Go to https://github.com/settings/developers → **New OAuth App**.
2. Fill in:
   - **Application name**: `EnvSync (local)`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**.
4. Copy the **Client ID** into `.env` as `GITHUB_ID`.
5. Click **Generate a new client secret**, copy it into `.env` as
   `GITHUB_SECRET`.
6. Restart `npm run dev`.

Now **Continue with GitHub** works on `/signin` and `/signup`, and — once
signed in — **Connect GitHub repository** on the dashboard's empty state
walks you through authorizing repo access and picking a real repository to
scan.

> **What EnvSync asks GitHub for, and why:** `read:user`/`user:email` at
> sign-in (just your identity), and `repo` only when you click connect (the
> only scope GitHub OAuth Apps offer for reading private repo contents —
> there's no narrower read-only option at the OAuth-App level). Full
> breakdown: [`docs/github-permissions.md`](docs/github-permissions.md).

---

## 5. Turn on PR checks (optional)

This makes EnvSync comment on pull requests that add an undocumented
environment variable.

1. Generate a secret: `openssl rand -hex 20`.
2. Put it in `.env` as `GITHUB_WEBHOOK_SECRET`, restart the app.
3. Connect a repository (§4) — EnvSync registers the webhook on that repo
   automatically at connect time. Nothing else to do per-repo.

**This only works once EnvSync is deployed somewhere GitHub can reach** —
`localhost` isn't reachable from GitHub's servers. If you want to test it
before a full deploy, tunnel your local server with something like
`ngrok http 3000` and set `NEXTAUTH_URL` to the tunnel's HTTPS URL for the
duration of the test.

---

## 6. Add the GitHub Actions check to a repo

Once a repository is connected, open its **CI setup** tab in the dashboard
— it shows the exact workflow YAML to copy into
`.github/workflows/envsync.yml`. It runs `npx envsync check` on every pull
request and fails the check if a critical issue exists.

---

## 7. Use the CLI (works completely offline, no account needed)

```bash
cd cli
npm install
npm run build
node dist/index.js scan /path/to/your/project
node dist/index.js check /path/to/your/project   # exits 1 on critical issues
```

To use it as a real global command later: `npm publish` from `cli/` (after
choosing a package name if `envsync` is taken), then anyone can
`npm install -g envsync`.

---

## 8. Everyday commands, once set up

| Command | What it does |
|---|---|
| `npm run dev` | Start the app locally |
| `npm run build` | Production build (also runs `prisma generate`) |
| `npm run db:push` | Sync the database schema after a `prisma/schema.prisma` change |
| `npm run db:seed` | Reset and reload the Acme SaaS demo data |
| `npx prisma studio` | Browse the database in a GUI |

---

## 9. Verification checklist

Run through this once after setup — each line should be true:

- [ ] `npm run dev` starts with no errors
- [ ] `/` loads the landing page with the pricing section
- [ ] `/signup` creates an account (email + password) and lands on `/dashboard`
- [ ] A brand-new account shows the "Connect your repository" empty state
- [ ] Demo login (`demo@envsync.dev`) shows the fully populated Acme SaaS dashboard
- [ ] Clicking a finding opens its issue detail page with a "How to fix" section
- [ ] The Environments tab lets you toggle a variable and the health score updates
- [ ] The Copilot tab answers "Why is staging failing?" using real data
- [ ] `cd cli && npm run build && node dist/index.js check ..` runs and prints a health score
- [ ] (After §4) "Continue with GitHub" on `/signin` completes and returns you to the app
- [ ] (After §4) Connecting a real repository runs a scan and populates its dashboard

---

## 10. Deploying (e.g. to Vercel)

1. Push this repo (or just the `envsync/` folder as its own repo) to GitHub.
2. Import it in Vercel (or your platform of choice) — Next.js needs no
   special config.
3. Set every variable from `.env` as an environment variable on the
   platform, with production values:
   - `DATABASE_URL` → your production Postgres (Neon/Supabase/Vercel
     Postgres/etc.)
   - `NEXTAUTH_URL` → your real domain, e.g. `https://envsync.yourdomain.com`
   - `NEXTAUTH_SECRET`, `ENCRYPTION_KEY` → generate fresh ones for
     production, don't reuse your local dev values
   - `GITHUB_ID` / `GITHUB_SECRET` → from a **second** OAuth App (§4) whose
     callback URL is `https://envsync.yourdomain.com/api/auth/callback/github`
   - `GITHUB_WEBHOOK_SECRET` → a fresh secret (§5)
4. Run `npm run db:push` once against the production database (from your
   machine, with `DATABASE_URL` pointed at prod) to create the tables.
5. Deploy. Then repeat the verification checklist above against the live
   URL.

---

## 11. What's actually in the database

If you're curious or something looks wrong, `npx prisma studio` is the
fastest way to look. The short version: `User`/`Organization`/`Membership`
handle accounts and roles; `Repository`/`Scan`/`Issue` are the scan
history; `EnvironmentVariable`/`VariableUsage` are what the scanner found
and where; `Environment`/`EnvironmentVariableState` are your manual
Local/Staging/Production configuration. Full schema:
[`prisma/schema.prisma`](prisma/schema.prisma). Nothing in any of these
tables is ever a real secret value — see
[`docs/github-permissions.md`](docs/github-permissions.md) for the full
security posture.

---

## Troubleshooting

**"UntrustedHost" error from Auth.js.** Make sure `NEXTAUTH_URL` in `.env`
matches the URL you're actually visiting the app at (including port).

**GitHub sign-in redirects back with an error.** Double-check the OAuth
App's callback URL is *exactly* `<your-url>/api/auth/callback/github` —
GitHub matches it literally, trailing slash and all.

**"Couldn't reach GitHub with the stored connection" on the repo picker.**
The stored token may have been revoked on GitHub's side — disconnect
GitHub in Settings and reconnect.

**`prisma db push` fails to connect.** Confirm Postgres is actually
running (`docker compose ps` if you used Docker) and that `DATABASE_URL` in
`.env` matches the credentials in `docker-compose.yml`.
