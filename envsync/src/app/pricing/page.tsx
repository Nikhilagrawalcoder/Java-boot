import Link from "next/link";
import type { Metadata } from "next";
import { Check, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS, COMPARISON_ROWS } from "@/lib/pricing-plans";

export const metadata: Metadata = { title: "Pricing · EnvSync" };

const BILLING_FAQS = [
  {
    question: "Is Free really free forever?",
    answer: "Yes — one repository, the full product, no credit card, no trial countdown.",
  },
  {
    question: "What happens if I go over my repository limit?",
    answer:
      "You can't connect another repository until you disconnect one or upgrade — nothing gets deleted or throttled.",
  },
  {
    question: "Can I downgrade later?",
    answer:
      "Yes, at any time. If you're over the new plan's limits (e.g. more repositories connected than Free allows), you'll need to disconnect down to the limit first.",
  },
  {
    question: "Do you offer discounts for open-source or nonprofits?",
    answer: "Reach out and we'll work something out — this isn't a self-serve flow yet.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing, no surprises
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Every plan gets the full product — scanning, health score, secret detection, PR
            checks, live Vercel sync, Copilot, and the API. Upgrade purely for scale: more
            repositories, more teammates, more API keys.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col text-left",
                  plan.highlighted &&
                    "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary sm:-translate-y-2"
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most popular
                  </Badge>
                )}
                <CardHeader>
                  <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                  <p className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={cn(buttonClasses(plan.highlighted ? "default" : "outline"), "w-full")}
                  >
                    {plan.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Compare plans</h2>
            <div className="mt-10 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="p-4 font-medium">Feature</th>
                    <th className="p-4 text-center font-medium">Free</th>
                    <th className="p-4 text-center font-medium text-foreground">Pro</th>
                    <th className="p-4 text-center font-medium">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0">
                      <td className="p-4 text-muted-foreground">{row.label}</td>
                      <td className="p-4 text-center">{row.free}</td>
                      <td className="p-4 text-center font-medium text-foreground">{row.pro}</td>
                      <td className="p-4 text-center">{row.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-2xl px-6 py-20">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Billing questions</h2>
            <div className="mt-8 divide-y divide-border rounded-xl border border-border">
              {BILLING_FAQS.map((faq) => (
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
      </main>

      <SiteFooter />
    </div>
  );
}
