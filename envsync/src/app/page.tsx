import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { PricingSection } from "@/components/landing/pricing-section";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Repository scanner",
    description:
      "Detects every process.env.X, os.getenv(), and framework config pattern in your codebase — never the values, only what exists and where.",
  },
  {
    title: ".env.example intelligence",
    description:
      "Compares your .env.example against real usage so nothing you need is undocumented, and nothing documented is stale.",
  },
  {
    title: "Environment comparison",
    description:
      "See at a glance which variables are missing in staging or production before a deploy fails because of them.",
  },
  {
    title: "Secret exposure detection",
    description:
      "Flags likely committed secrets like sk_live_ and AKIA keys with masked previews — full values are never stored or shown.",
  },
  {
    title: "Configuration health score",
    description:
      "One transparent 0–100 score with a visible breakdown of exactly what is costing or earning points.",
  },
  {
    title: "CI-ready CLI",
    description:
      "`envsync check` returns a non-zero exit code on critical issues, so broken configuration never reaches production.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pb-20 pt-20 text-center sm:pt-28">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Your SaaS works. Until one environment variable doesn&apos;t.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            EnvSync automatically discovers, compares, and validates your application&apos;s
            configuration across environments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/signup" className={cn(buttonClasses("default", "lg"))}>
              Connect GitHub — Free
            </Link>
            <Link href="#preview" className={cn(buttonClasses("outline", "lg"))}>
              See Demo
            </Link>
          </div>
        </section>

        <section id="preview" className="mx-auto flex max-w-5xl justify-center px-6 pb-20">
          <DashboardPreview />
        </section>

        <section id="features" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Know before you deploy
              </h2>
              <p className="mt-3 text-muted-foreground">
                Not a secrets manager. A validation layer that tells you what&apos;s broken.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EnvSync. Not a secrets manager — a configuration validation
        layer.
      </footer>
    </div>
  );
}
