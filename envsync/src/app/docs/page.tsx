import Link from "next/link";
import type { Metadata } from "next";
import { DocsPager } from "@/components/docs/docs-pager";

export const metadata: Metadata = { title: "Introduction" };

export default function DocsIntroductionPage() {
  return (
    <article className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Introduction</p>
        <h1 className="text-3xl font-semibold tracking-tight">What EnvSync does</h1>
      </div>

      <p className="text-muted-foreground">
        EnvSync is a configuration intelligence layer for teams that ship SaaS applications.
        It scans your repository for every environment variable your code actually reads, compares
        that list against what&apos;s configured across your environments, and flags the gaps before
        they become a production incident — a missing <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">STRIPE_WEBHOOK_SECRET</code>{" "}
        in staging, a Supabase key that only exists locally, a secret that got hardcoded into a
        committed file.
      </p>

      <p className="text-muted-foreground">
        It is deliberately <strong className="text-foreground">not</strong> a secrets manager. EnvSync
        never stores, transmits, or displays the actual value of a secret. It only ever knows
        variable <em>names</em> and whether each one is configured — the same information you could
        get by grepping your codebase and reading your platform&apos;s environment settings by hand,
        just done automatically and continuously.
      </p>

      <h2 className="pt-4 text-xl font-semibold tracking-tight">How it works, in short</h2>
      <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Scan.</strong> EnvSync reads your source files
          (read-only) and detects every <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">process.env.X</code>,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">os.getenv(...)</code>, and
          equivalent reference, along with the exact file and line it&apos;s used on.
        </li>
        <li>
          <strong className="text-foreground">Classify.</strong> Each detected variable is matched
          against a knowledge base of 500+ real vendors (Stripe, Supabase, Twilio, AWS, and hundreds
          more) so EnvSync knows what kind of credential it likely is.
        </li>
        <li>
          <strong className="text-foreground">Compare.</strong> Variables are checked against your{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">.env.example</code> file
          and against every environment you&apos;ve configured (Local, Staging, Production, ...), to
          find what&apos;s missing, undocumented, or unused.
        </li>
        <li>
          <strong className="text-foreground">Score.</strong> Every issue has a transparent, fixed
          point value. Your Configuration Health score is just 100 minus the sum of active issue
          penalties — no black box, no hidden weighting.
        </li>
      </ol>

      <h2 className="pt-4 text-xl font-semibold tracking-tight">Where to go next</h2>
      <p className="text-muted-foreground">
        If you want to see it running against your own repository right away, start with the{" "}
        <Link href="/docs/quickstart" className="font-medium text-foreground underline underline-offset-4">
          Quickstart
        </Link>
        . To understand exactly how scanning, scoring, and secret detection work under the hood, read{" "}
        <Link href="/docs/concepts" className="font-medium text-foreground underline underline-offset-4">
          Core concepts
        </Link>
        .
      </p>

      <DocsPager currentHref="/docs" />
    </article>
  );
}
