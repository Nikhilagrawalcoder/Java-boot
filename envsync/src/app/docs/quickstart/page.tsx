import Link from "next/link";
import type { Metadata } from "next";
import { DocsPager } from "@/components/docs/docs-pager";

export const metadata: Metadata = { title: "Quickstart" };

export default function DocsQuickstartPage() {
  return (
    <article className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Get started</p>
        <h1 className="text-3xl font-semibold tracking-tight">Quickstart</h1>
        <p className="text-muted-foreground">Go from signed out to a real health score in about two minutes.</p>
      </div>

      <ol className="space-y-6">
        <li className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">1. Create an account</h2>
          <p className="text-muted-foreground">
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Sign up
            </Link>{" "}
            with GitHub or an email and password. The Free plan covers one repository with no card
            required.
          </p>
        </li>

        <li className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">2. Connect a repository</h2>
          <p className="text-muted-foreground">
            From the dashboard, choose <strong className="text-foreground">Connect a repository</strong> and
            authorize read-only access to a single repository — never your whole account, never write
            access. See{" "}
            <Link href="/docs/github-permissions" className="font-medium text-foreground underline underline-offset-4">
              GitHub permissions
            </Link>{" "}
            for exactly what that grants.
          </p>
        </li>

        <li className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">3. Let the first scan run</h2>
          <p className="text-muted-foreground">
            EnvSync reads your source tree once, detects every environment variable your code
            references, and diffs that against your{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">.env.example</code>. You land on
            the Overview tab with a Configuration Health score and a list of findings, ranked
            critical first.
          </p>
        </li>

        <li className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">4. Describe your environments</h2>
          <p className="text-muted-foreground">
            On the <strong className="text-foreground">Environments</strong> tab, add Local, Staging, and
            Production (or whatever names you use), then mark which detected variables are actually
            configured in each. EnvSync never asks for the values — just a checkbox per
            variable/environment pair.
          </p>
        </li>

        <li className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">5. Wire it into CI</h2>
          <p className="text-muted-foreground">
            The <strong className="text-foreground">CI setup</strong> tab generates a ready-to-commit GitHub
            Actions workflow that runs the same checks on every pull request, so a missing or exposed
            variable fails the PR instead of reaching production. It works entirely offline using the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">envsync</code> CLI — no
            account, no network call from your CI runner.
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm">
            <code>npx envsync check</code>
          </pre>
        </li>
      </ol>

      <DocsPager currentHref="/docs/quickstart" />
    </article>
  );
}
