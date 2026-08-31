import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = { title: "Terms of Service · EnvSync" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 28, 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">1. What EnvSync is</h2>
          <p className="text-muted-foreground">
            EnvSync scans repositories you connect for environment-variable usage, compares it
            against what&apos;s configured across your environments, and reports a Configuration
            Health score and specific issues. It is a diagnostic tool, not a secrets manager, a
            deployment platform, or a guarantee that your application will run correctly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">2. Your account</h2>
          <p className="text-muted-foreground">
            You&apos;re responsible for the accuracy of information you provide, for keeping your
            credentials and API keys secure, and for anything that happens under your account.
            Don&apos;t share API keys outside your organization or commit them to source control.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">3. Acceptable use</h2>
          <p className="text-muted-foreground">
            Only connect repositories you&apos;re authorized to scan. Don&apos;t use EnvSync to
            probe, scan, or exfiltrate data from repositories you don&apos;t own or have explicit
            permission to access. Don&apos;t attempt to circumvent plan limits, rate limits, or
            API authentication.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">4. Plans and billing</h2>
          <p className="text-muted-foreground">
            Free, Pro, and Team plans and their limits are described on the{" "}
            <a href="/pricing" className="underline underline-offset-4">
              pricing page
            </a>
            . Paid plans are billed in advance on a recurring basis; you can downgrade or cancel
            at any time, effective at the end of the current billing period.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">5. No warranty</h2>
          <p className="text-muted-foreground">
            EnvSync is provided &quot;as is.&quot; A passing Configuration Health score doesn&apos;t
            guarantee your application is free of configuration issues, and a low score doesn&apos;t
            capture every possible problem — it reflects what the scanner&apos;s detection rules
            actually check for. Use it as one signal among others, not as the sole gate before a
            production deploy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">6. Limitation of liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, EnvSync isn&apos;t liable for indirect,
            incidental, or consequential damages arising from your use of the product, including
            issues it failed to detect or false positives it reported.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">7. Changes</h2>
          <p className="text-muted-foreground">
            We may update these terms as the product changes; material changes will be reflected
            here with an updated date. Continuing to use EnvSync after a change means you accept
            the updated terms.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          This is a plain-language template for a small product, not a substitute for legal
          advice. Have it reviewed by counsel before relying on it for a commercial deployment.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
