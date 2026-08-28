import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { DocsPager } from "@/components/docs/docs-pager";
import { PROVIDER_COUNT } from "@/lib/scan/classify";

export const metadata: Metadata = { title: "FAQ" };

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
}

export default function DocsFaqPage() {
  const faqs: Array<{ question: string; answer: React.ReactNode }> = [
    {
      question: "Doesn't GitHub already do this for free?",
      answer: (
        <>
          GitHub&apos;s secret scanning catches credentials committed to git, and does that well — keep it
          on. It has no visibility into anything outside your repository: whether a variable is actually
          set in your Staging environment on Vercel, whether <Code>.env.example</Code> is stale, or whether
          your next deploy is about to crash because a required variable was never configured anywhere.
          That&apos;s not a git problem, so GitHub structurally can&apos;t see it. EnvSync&apos;s{" "}
          <a
            href="/docs/concepts#live-deploy-sync"
            className="font-medium text-foreground underline underline-offset-4"
          >
            live Vercel sync
          </a>{" "}
          reads what&apos;s actually deployed, not just what&apos;s committed.
        </>
      ),
    },
    {
      question: "Is EnvSync a secrets manager?",
      answer: (
        <>
          No. EnvSync never stores actual secret values. It&apos;s a configuration intelligence
          layer: it detects which variables your code needs, compares them across environments, and
          flags what&apos;s missing, undocumented, or exposed. For storing and rotating secrets, keep
          using Vault, Doppler, 1Password, or your platform&apos;s native secrets manager alongside
          EnvSync.
        </>
      ),
    },
    {
      question: "What GitHub access does it need?",
      answer: (
        <>
          <Code>read:user</Code> and <Code>user:email</Code> at sign-in — just your identity.
          Read-only repository access is requested separately, only when you choose to connect a
          repository, and only for that repository. See{" "}
          <a href="/docs/github-permissions" className="font-medium text-foreground underline underline-offset-4">
            GitHub permissions
          </a>{" "}
          for the full breakdown.
        </>
      ),
    },
    {
      question: "Do I have to upload my production secrets?",
      answer: (
        <>
          Never. Production configuration is represented as metadata you configure manually — which
          variables exist and whether they&apos;re set — not the values themselves. Local and staging
          work the same way.
        </>
      ),
    },
    {
      question: "How does EnvSync know which vendor a variable belongs to?",
      answer: (
        <>
          Against a static knowledge base of {PROVIDER_COUNT}+ real vendors and their conventional
          env-var naming patterns — plain substring matching, not machine learning. See{" "}
          <a href="/docs/concepts" className="font-medium text-foreground underline underline-offset-4">
            Core concepts
          </a>
          .
        </>
      ),
    },
    {
      question: "What languages and frameworks are supported?",
      answer: (
        <>
          Next.js, React, Vite, Node.js/Express, and Python/Django out of the box —{" "}
          <Code>process.env</Code>, <Code>os.getenv</Code>, <Code>os.environ</Code>, and{" "}
          <Code>import.meta.env</Code> patterns are all detected, along with{" "}
          <Code>NEXT_PUBLIC_</Code>, <Code>VITE_</Code>, and <Code>REACT_APP_</Code> prefixed public
          variables.
        </>
      ),
    },
    {
      question: "Can I use the CLI without an account?",
      answer: (
        <>
          Yes. <Code>envsync scan</Code> and <Code>envsync check</Code> run entirely offline against
          your local filesystem using the same detection engine as the dashboard — no sign-up, no
          network call.
        </>
      ),
    },
    {
      question: "What happens on the Free plan?",
      answer: (
        <>
          One repository, basic scanning, your Configuration Health score, and basic issue detection
          — free forever, no credit card required.
        </>
      ),
    },
    {
      question: "Does EnvSync slow down my CI pipeline?",
      answer: (
        <>
          No — <Code>envsync check</Code> runs against your working directory with no network calls,
          so it typically finishes in well under a second for most repositories. It exits non-zero
          only when a critical issue exists, so it&apos;s safe to add as a required check.
        </>
      ),
    },
  ];

  return (
    <article className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Reference</p>
        <h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:content-none">
              {faq.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>

      <DocsPager currentHref="/docs/faq" />
    </article>
  );
}
