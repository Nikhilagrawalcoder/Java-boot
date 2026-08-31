import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/pricing-plans";

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Simple pricing, no surprises
        </h2>
        <p className="mt-3 text-muted-foreground">
          Every plan gets the full product. Upgrade for more repositories, seats, and API keys —
          see the{" "}
          <Link href="/pricing" className="underline underline-offset-4">
            full comparison
          </Link>
          .
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative flex flex-col",
              plan.highlighted && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary sm:-translate-y-2"
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
  );
}
