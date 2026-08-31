import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { GITHUB_REPO_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Security · EnvSync" };

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 31, 2026</p>
        </div>

        <p className="text-muted-foreground">
          EnvSync&apos;s entire premise is handling configuration without ever touching the
          secrets it points to. That constraint shapes the security model more than any single
          control does — see the full breakdown in{" "}
          <Link href="/docs/github-permissions" className="text-foreground underline underline-offset-4">
            GitHub permissions
          </Link>
          . This page covers everything else.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">What&apos;s encrypted at rest</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              GitHub and Vercel access tokens are encrypted with AES-256-GCM before being written
              to the database (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src/lib/crypto.ts</code>),
              keyed by a server-side <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">ENCRYPTION_KEY</code> that
              never leaves the environment.
            </li>
            <li>
              Passwords are hashed with bcrypt before storage — the plaintext password is never
              written anywhere, including logs.
            </li>
            <li>
              API keys are stored as a one-way hash plus a short display prefix. The plaintext key
              is shown exactly once, at creation, and can&apos;t be recovered afterward — only
              revoked and reissued.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">What EnvSync deliberately can&apos;t see</h2>
          <p className="text-muted-foreground">
            The scanner detects environment variable <em>names</em> by pattern-matching source
            code — it has no code path that reads a resolved value from a running process,
            a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">.env</code> file's
            right-hand side, or a provider&apos;s API. When Vercel&apos;s API returns a value for a
            non-sensitive variable, that field is discarded before the response is used for
            anything. There&apos;s no configuration flag that changes this — it&apos;s the shape of
            the code, not a setting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">GitHub access</h2>
          <p className="text-muted-foreground">
            EnvSync requests read-only repository access to scan source code — never write access,
            and never your whole account by default (you choose all-repos or public-only scope when
            connecting). Webhook payloads from GitHub are verified against an HMAC-SHA256 signature
            before being processed, so a request claiming to be a GitHub webhook has to prove it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Sessions and access control</h2>
          <p className="text-muted-foreground">
            Authentication runs on Auth.js with signed, server-verified sessions. Every dashboard
            route and server action checks that the requesting user belongs to the organization
            that owns the repository or resource in question before returning anything —
            membership is re-verified on each request, not cached client-side.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Reporting a vulnerability</h2>
          <p className="text-muted-foreground">
            EnvSync doesn&apos;t run a formal bug bounty program. If you find a security issue,
            please open a private security advisory (or, if that&apos;s not available, an issue
            marked clearly as security-sensitive) on{" "}
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
              the source repository
            </a>{" "}
            rather than a public issue, and give us a chance to fix it before any public
            disclosure.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          This describes the security posture of the product as built — it&apos;s not a
          compliance certification (SOC 2, ISO 27001, etc.), and EnvSync doesn&apos;t currently
          hold one.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
