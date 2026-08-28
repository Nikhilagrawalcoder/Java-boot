import type { Metadata } from "next";
import { DocsPager } from "@/components/docs/docs-pager";
import { PROVIDER_COUNT } from "@/lib/scan/classify";

export const metadata: Metadata = { title: "Core concepts" };

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
}

export default function DocsConceptsPage() {
  return (
    <article className="max-w-2xl space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Guides</p>
        <h1 className="text-3xl font-semibold tracking-tight">Core concepts</h1>
        <p className="text-muted-foreground">
          The four ideas everything else in EnvSync is built from: scanning, classification,
          environments, and the health score.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Scanning</h2>
        <p className="text-muted-foreground">
          EnvSync never asks you to declare your environment variables — it finds them by reading
          your source code. The scanner walks every file in your repository (skipping{" "}
          <Code>node_modules</Code>, build output, and other generated directories) and matches
          known access patterns:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <Code>process.env.X</Code> and <Code>process.env[&quot;X&quot;]</Code> — Node.js, Next.js, Express
          </li>
          <li>
            <Code>import.meta.env.X</Code> — Vite
          </li>
          <li>
            <Code>os.getenv(&quot;X&quot;)</Code>, <Code>os.environ[&quot;X&quot;]</Code>, <Code>os.environ.get(&quot;X&quot;)</Code> — Python
          </li>
        </ul>
        <p className="text-muted-foreground">
          Every match is recorded with its exact file path and line number, so every finding in the
          dashboard links straight back to the code that needs it — never just a bare variable name.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Classification</h2>
        <p className="text-muted-foreground">
          Once a variable is detected, EnvSync matches its name against a knowledge base of{" "}
          {PROVIDER_COUNT}+ real vendors — cloud databases, payment processors, auth providers, AI
          APIs, monitoring tools, and more — using their conventional naming patterns (a variable
          containing <Code>STRIPE</Code> is Stripe, one containing <Code>SUPABASE</Code> is Supabase,
          and so on). This is plain pattern matching against a static table, not machine learning —
          fully deterministic and auditable. A variable that doesn&apos;t match any known vendor still
          gets a best-effort category from generic naming conventions (<Code>_URL</Code>,{" "}
          <Code>DATABASE</Code>, <Code>AUTH</Code>, ...), and falls back to &quot;Application
          configuration&quot; if nothing matches at all.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Environments</h2>
        <p className="text-muted-foreground">
          An environment (Local, Staging, Production, or any name you choose) is just a label plus
          a checklist: for every variable EnvSync detected in your code, is it configured here or
          not? You set that by hand, or by pointing EnvSync at a specific{" "}
          <Code>.env.*</Code> file for that environment when you&apos;re comfortable doing so. Either
          way, EnvSync only ever stores the boolean — configured or not — never the value itself.
          This is the core reason it isn&apos;t a secrets manager: it has nothing to leak, because it
          never received anything secret in the first place.
        </p>
      </section>

      <section className="space-y-3" id="live-deploy-sync">
        <h2 className="text-xl font-semibold tracking-tight">Live deploy sync (Vercel)</h2>
        <p className="text-muted-foreground">
          Manually toggling &quot;is this configured?&quot; per environment works, but it drifts — someone adds a
          variable on Vercel and forgets to reflect it here. Connect a Vercel project from the{" "}
          <strong className="text-foreground">Environments</strong> tab with an API token and project ID,
          and EnvSync reads the actual variable <em>names</em> configured for Production, Preview, and
          Development directly from Vercel&apos;s API — never the values, even though Vercel&apos;s API can
          return them for non-sensitive variables. Those three environments switch from manual checkboxes
          to read-only, ground-truth status, and re-sync automatically on every scan. This is the one
          piece of the picture a git-based tool like GitHub&apos;s secret scanning cannot see at all: it has
          no access to your deploy platform, only to what&apos;s committed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Secret exposure detection</h2>
        <p className="text-muted-foreground">
          Separately from environment-variable scanning, EnvSync checks your source files for
          credential-shaped strings that shouldn&apos;t be there at all — a live key hardcoded into a
          config file instead of read from the environment. It recognizes several vendor key formats
          directly (Stripe secret/restricted keys, AWS access key IDs, GitHub tokens, PEM private
          keys) and flags them as <strong className="text-foreground">Critical</strong>. It also flags
          suspicious assignments to variables named like <Code>key</Code>, <Code>secret</Code>,{" "}
          <Code>token</Code>, or <Code>password</Code> holding a long string with no recognizable
          format, as a lower-confidence <strong className="text-foreground">Warning</strong> — unless
          the value looks like an obvious placeholder (<Code>your_key_here</Code>,{" "}
          <Code>xxxx</Code>, and similar). Every match is masked in the dashboard — you see enough of
          the value to identify which credential it is, never the full value.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">The Configuration Health score</h2>
        <p className="text-muted-foreground">
          The score is a plain, transparent calculation — 100 points, minus a fixed penalty per
          active issue. There is no hidden weighting and no machine-learning model behind it; the
          same set of issues always produces the same score.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Issue</th>
                <th className="p-3 text-right">Penalty</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="p-3">Missing variable in Production</td>
                <td className="p-3 text-right font-mono">−20</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Secret exposure (critical)</td>
                <td className="p-3 text-right font-mono">−15</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Missing variable in Staging</td>
                <td className="p-3 text-right font-mono">−10</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Environment inconsistency</td>
                <td className="p-3 text-right font-mono">−8</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Missing variable in Development</td>
                <td className="p-3 text-right font-mono">−6</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Possible hardcoded credential (warning)</td>
                <td className="p-3 text-right font-mono">−5</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Missing from .env.example</td>
                <td className="p-3 text-right font-mono">−5</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3">Missing variable in Local</td>
                <td className="p-3 text-right font-mono">−4</td>
              </tr>
              <tr>
                <td className="p-3">Unused variable / unused .env.example entry</td>
                <td className="p-3 text-right font-mono">−2</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground">
          If every variable is documented and there are no critical issues, EnvSync adds a flat +10
          bonus. The final score is clamped between 0 and 100. The exact breakdown — which issues
          contributed which points — is always visible from the Overview tab, so the number is never
          a mystery.
        </p>
      </section>

      <DocsPager currentHref="/docs/concepts" />
    </article>
  );
}
