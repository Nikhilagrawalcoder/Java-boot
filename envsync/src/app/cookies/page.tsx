import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = { title: "Cookie Policy · EnvSync" };

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 31, 2026</p>
        </div>

        <p className="text-muted-foreground">
          This is a short policy because EnvSync sets very few cookies. There&apos;s no analytics
          or advertising tracking on this site — every cookie below exists to make the product
          itself work.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Cookies we set</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Session cookie</strong> — set by Auth.js after
              you sign in, so the app knows which account is making a request. Expires when your
              session does; deleting it signs you out.
            </li>
            <li>
              <strong className="text-foreground">OAuth state cookies</strong> — short-lived
              (10 minutes), created only during the moment you click &quot;Connect GitHub&quot; or
              &quot;Connect with Vercel,&quot; and deleted immediately after that connection
              completes or fails. They exist purely to verify the redirect back from GitHub or
              Vercel is legitimate, and carry no personal data.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Cookies we don&apos;t set</h2>
          <p className="text-muted-foreground">
            No analytics cookies, no advertising or retargeting pixels, no third-party tracking
            scripts. If that ever changes, this page will change with it — and given
            EnvSync&apos;s whole position is not collecting more than it needs to, we&apos;d rather
            not.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Other browser storage</h2>
          <p className="text-muted-foreground">
            Your light/dark theme preference is remembered in your browser&apos;s{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">localStorage</code>,
            not a cookie — it never leaves your browser or reaches our servers. Clearing your
            browser&apos;s site data resets it to the default.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Your controls</h2>
          <p className="text-muted-foreground">
            You can block or delete cookies in your browser at any time — doing so for the session
            cookie will just sign you out. See{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>{" "}
            for what account data is stored beyond cookies.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
