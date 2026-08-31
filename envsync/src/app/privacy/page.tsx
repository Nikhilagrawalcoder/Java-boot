import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = { title: "Privacy Policy · EnvSync" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 28, 2026</p>
        </div>

        <p className="text-muted-foreground">
          This policy explains what EnvSync collects, why, and — just as importantly — what it
          deliberately never collects. If you want the short version:{" "}
          <strong className="text-foreground">
            EnvSync never reads, transmits, or stores the value of any environment variable or
            secret
          </strong>
          . Everything below is about the metadata around that guarantee.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Account information:</strong> your name and
              email address (from GitHub OAuth or from your email/password sign-up), and a hashed
              password if you signed up with email.
            </li>
            <li>
              <strong className="text-foreground">GitHub access token:</strong> encrypted at rest
              (AES-256-GCM), used only to read repository contents on your behalf. Never displayed
              back to you or any other user after it's stored.
            </li>
            <li>
              <strong className="text-foreground">Scan metadata:</strong> environment variable{" "}
              <em>names</em>, the file paths and line numbers they&apos;re used at, whether each is
              marked configured per environment, issue descriptions, and your Configuration Health
              score history.
            </li>
            <li>
              <strong className="text-foreground">API keys:</strong> a one-way hash and a short
              display prefix. The plaintext key is shown to you once, at creation, and never
              stored or shown again.
            </li>
            <li>
              <strong className="text-foreground">Vercel connection (optional):</strong> if you
              connect a Vercel project, your API token is encrypted at rest and used only to list
              environment variable <em>names</em> per deployment target — never their values.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">What we never collect</h2>
          <p className="text-muted-foreground">
            The actual value of any environment variable, secret, API key, password, or
            credential — from your codebase, your `.env` files, your GitHub repository, or your
            connected deploy platform. EnvSync&apos;s detection engine is built to recognize{" "}
            <em>names</em> and patterns, not to read or transmit values, and there is no code path
            in the product that does otherwise.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">How data is used</h2>
          <p className="text-muted-foreground">
            To run the product: authenticate you, scan repositories you explicitly connect, show
            your dashboard, send the invitations and notifications you trigger, and process
            payments if you&apos;re on a paid plan. We don&apos;t sell data to third parties, and we
            don&apos;t use scan metadata for anything beyond operating and improving the product
            for your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Your controls</h2>
          <p className="text-muted-foreground">
            Disconnect GitHub or delete a repository&apos;s scan data at any time from Settings —
            this removes every stored variable, issue, and score history entry for that
            repository. Revoke an API key or a Vercel connection the same way. Deleting your
            account removes your user record and memberships; contact us if you need help with
            anything this self-service flow doesn&apos;t cover.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Third parties</h2>
          <p className="text-muted-foreground">
            GitHub (for OAuth and repository access) and, if you choose to connect one, Vercel
            (for live environment coverage). We use a database provider (Supabase or your own
            Postgres, if self-hosting) to store the account and scan metadata described above.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          This is a plain-language policy for a small product, not a substitute for legal advice.
          If you need a policy reviewed against a specific regulatory regime (GDPR, CCPA, HIPAA,
          etc.) for your own deployment, have it reviewed by counsel before relying on it.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
