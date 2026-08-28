import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Doesn't GitHub already do this for free?",
    answer:
      "GitHub's secret scanning catches credentials committed to git — and it's genuinely good at that, keep it on. It has no visibility into anything outside your repository, though: whether STRIPE_WEBHOOK_SECRET is actually set in your Staging environment on Vercel, whether .env.example is out of date, or whether a variable your code needs was ever configured anywhere. That's a deploy-platform problem, not a git problem, and it's what EnvSync exists for — including live sync from your Vercel project, not just what's committed to git.",
  },
  {
    question: "Is EnvSync a secrets manager?",
    answer:
      "No. EnvSync never stores actual secret values. It's a configuration intelligence layer: it detects which variables your code needs, compares them across environments, and flags what's missing, undocumented, or exposed. For storing and rotating secrets, keep using Vault, Doppler, 1Password, or your platform's native secrets manager alongside EnvSync.",
  },
  {
    question: "What GitHub access does it need?",
    answer:
      "Read:user and email at sign-in — just your identity. Read-only repository access is requested separately, only when you choose to connect a repository, and only for that repository. EnvSync never requests write access.",
  },
  {
    question: "Do I have to upload my production secrets?",
    answer:
      "Never. Production configuration is represented as metadata you configure manually — which variables exist and whether they're set — not the values themselves. Local and staging work the same way.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer:
      "Next.js, React, Vite, Node.js/Express, and Python/Django out of the box — process.env, os.getenv, os.environ, and import.meta.env patterns are all detected, along with NEXT_PUBLIC_ and VITE_ prefixed public variables.",
  },
  {
    question: "Can I use the CLI without an account?",
    answer:
      "Yes. envsync scan and envsync check run entirely offline against your local filesystem using the same detection engine as the dashboard — no sign-up, no network call.",
  },
  {
    question: "What happens on the Free plan?",
    answer:
      "One repository, basic scanning, your configuration health score, and basic issue detection — free forever, no credit card required.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-10 divide-y divide-border rounded-xl border border-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:content-none">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
