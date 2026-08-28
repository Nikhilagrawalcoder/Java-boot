import Link from "next/link";
import type { Metadata } from "next";
import { DocsPager } from "@/components/docs/docs-pager";

export const metadata: Metadata = { title: "API & SDK" };

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
}

function EndpointBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={
        method === "GET"
          ? "rounded bg-success/15 px-1.5 py-0.5 font-mono text-xs font-medium text-success"
          : "rounded bg-primary/15 px-1.5 py-0.5 font-mono text-xs font-medium text-primary"
      }
    >
      {method}
    </span>
  );
}

export default function DocsApiPage() {
  return (
    <article className="max-w-2xl space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Reference</p>
        <h1 className="text-3xl font-semibold tracking-tight">API &amp; SDK</h1>
        <p className="text-muted-foreground">
          A REST API for reading your organization&apos;s repositories, scores, and issues from your
          own scripts or CI pipelines — and a TypeScript SDK that wraps it.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Authentication</h2>
        <p className="text-muted-foreground">
          Create a key from{" "}
          <strong className="text-foreground">Settings → API keys</strong> — the plaintext is shown
          exactly once, so copy it immediately. Send it as a bearer token on every request:
        </p>
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm">
          <code>Authorization: Bearer envsk_live_...</code>
        </pre>
        <p className="text-muted-foreground">
          A key only ever grants read access to the metadata already visible in your dashboard —
          variable names, health scores, issue descriptions, file/line locations — never secret
          values, since EnvSync never stores those in the first place. A missing or revoked key
          returns <Code>401</Code>; a repository outside your organization returns <Code>404</Code>{" "}
          rather than confirming it belongs to someone else.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Base URL</h2>
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm">
          <code>https://envsync.dev/api/v1</code>
        </pre>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Endpoints</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EndpointBadge method="GET" />
            <Code>/api/v1/repositories</Code>
          </div>
          <p className="text-muted-foreground">Lists every repository connected to your organization.</p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
            <code>{`{
  "data": [
    {
      "id": "cmt...",
      "name": "acme-saas",
      "fullName": "acme/acme-saas",
      "defaultBranch": "main",
      "isPrivate": true,
      "healthScore": 63,
      "lastScanAt": "2026-08-28T07:23:43.542Z",
      "createdAt": "2026-08-28T07:23:43.543Z"
    }
  ]
}`}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EndpointBadge method="GET" />
            <Code>/api/v1/repositories/:id</Code>
          </div>
          <p className="text-muted-foreground">
            A repository&apos;s current health score, score breakdown, issue counts, and per-environment
            coverage.
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
            <code>{`{
  "data": {
    "id": "cmt...",
    "name": "acme-saas",
    "fullName": "acme/acme-saas",
    "healthScore": 63,
    "scoreBreakdown": [
      { "label": "Secret exposure", "delta": -15 },
      { "label": "Missing staging variable ×2", "delta": -20 }
    ],
    "issueCounts": { "critical": 3, "warning": 1, "healthy": 17 },
    "environments": [
      { "id": "cmt...", "name": "Staging", "kind": "STAGING", "configured": 5, "total": 7 }
    ],
    "lastScanAt": "2026-08-28T07:23:43.542Z"
  }
}`}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EndpointBadge method="GET" />
            <Code>/api/v1/repositories/:id/issues</Code>
          </div>
          <p className="text-muted-foreground">
            Lists issues for a repository. Optional query params: <Code>status</Code> (
            <Code>OPEN</Code> | <Code>RESOLVED</Code> | <Code>IGNORED</Code>, default{" "}
            <Code>OPEN</Code>) and <Code>severity</Code> (<Code>CRITICAL</Code> |{" "}
            <Code>WARNING</Code> | <Code>INFO</Code>).
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
            <code>{`GET /api/v1/repositories/cmt.../issues?severity=critical

{
  "data": [
    {
      "id": "cmt...",
      "type": "SECRET_EXPOSURE",
      "severity": "CRITICAL",
      "status": "OPEN",
      "title": "Possible Stripe secret key exposed in config/payment.js",
      "description": "Move this value into an environment variable...",
      "filePath": "config/payment.js",
      "lineNumber": 14,
      "variableKey": null,
      "environmentName": null,
      "createdAt": "2026-08-28T07:23:43.688Z"
    }
  ]
}`}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EndpointBadge method="POST" />
            <Code>/api/v1/repositories/:id/rescan</Code>
          </div>
          <p className="text-muted-foreground">
            Triggers a fresh scan and waits for it to finish before responding — useful as a CI step
            that runs before <Code>envsync check</Code>. Returns <Code>502</Code> if the scan itself
            fails (for example, if the organization&apos;s GitHub connection was revoked).
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
            <code>{`{ "data": { "status": "completed", "scanId": "cmt...", "healthScore": 71 } }`}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">TypeScript SDK</h2>
        <p className="text-muted-foreground">
          <Code>@envsync/sdk</Code> wraps every endpoint above in a typed client, for Node.js 18+ and
          the browser:
        </p>
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm">
          <code>npm install @envsync/sdk</code>
        </pre>
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
          <code>{`import { EnvSyncClient } from "@envsync/sdk";

const client = new EnvSyncClient({ apiKey: process.env.ENVSYNC_API_KEY! });

const repos = await client.listRepositories();
const repo = await client.getRepository(repos[0].id);
const critical = await client.listIssues(repo.id, { severity: "CRITICAL" });
await client.rescan(repo.id);`}</code>
        </pre>
        <p className="text-muted-foreground">
          Non-2xx responses throw <Code>EnvSyncApiError</Code>, carrying the HTTP status and the
          API&apos;s error message, so you can branch on <Code>err.status</Code> instead of parsing
          strings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">curl example</h2>
        <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-xs">
          <code>{`curl https://envsync.dev/api/v1/repositories \\
  -H "Authorization: Bearer envsk_live_..."`}</code>
        </pre>
      </section>

      <p className="text-muted-foreground">
        Prefer running checks without any network dependency at all? The{" "}
        <Code>envsync</Code> CLI covers the same detection engine entirely offline — see the{" "}
        <Link href="/docs/quickstart" className="font-medium text-foreground underline underline-offset-4">
          Quickstart
        </Link>
        .
      </p>

      <DocsPager currentHref="/docs/api" />
    </article>
  );
}
