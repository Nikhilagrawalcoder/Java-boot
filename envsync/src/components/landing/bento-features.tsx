import {
  FileSearch,
  FileCheck2,
  ShieldAlert,
  GitCompareArrows,
  Gauge,
  Terminal,
  Cloud,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthGauge } from "@/components/health-gauge";
import { EnvironmentCard } from "@/components/environment-card";
import { FindingItem } from "@/components/finding-item";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  preview: React.ReactNode;
  span?: string;
  accent?: "default" | "destructive";
}

const FEATURES: Feature[] = [
  {
    icon: FileSearch,
    title: "Repository scanner",
    description:
      "Detects every process.env.X, os.getenv(), and framework config pattern across your codebase — key names and locations only, never values.",
    span: "lg:col-span-2",
    preview: (
      <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 font-mono text-xs leading-relaxed">
        <span className="text-muted-foreground">// src/lib/stripe.ts</span>
        {"\n"}
        const key = <span className="text-primary">process.env</span>.STRIPE_SECRET_KEY;
        {"\n\n"}
        <span className="text-muted-foreground"># src/settings.py</span>
        {"\n"}
        SECRET = <span className="text-primary">os.getenv</span>(&quot;DJANGO_SECRET_KEY&quot;)
      </pre>
    ),
  },
  {
    icon: Gauge,
    title: "Health score",
    description: "One transparent 0–100 score, with a visible +/- breakdown of every factor.",
    preview: (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <HealthGauge score={82} />
      </div>
    ),
  },
  {
    icon: Cloud,
    title: "Live Vercel sync",
    description:
      "Connects to your Vercel project and reads what's actually configured in Production and Preview — not just what's committed to git, which is all a code-scanning tool can ever see.",
    preview: (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-muted-foreground">Connected to Vercel — synced 2 min ago</span>
      </div>
    ),
  },
  {
    icon: FileCheck2,
    title: ".env.example intelligence",
    description:
      "Catches variables used in code but undocumented, and entries that are declared but no longer used.",
    preview: (
      <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2 font-mono text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          STRIPE_WEBHOOK_SECRET
        </div>
        <p className="pl-[22px] text-xs text-muted-foreground">used in code, missing from .env.example</p>
      </div>
    ),
  },
  {
    icon: ShieldAlert,
    title: "Secret exposure detection",
    description:
      "Flags likely committed secrets — Stripe, AWS, GitHub tokens, private keys — with masked previews only.",
    accent: "destructive",
    preview: (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
        <FindingItem severity="critical">
          <span className="font-mono text-xs">sk_live_••••••••••••9X2A</span> in config/payment.js
        </FindingItem>
      </div>
    ),
  },
  {
    icon: GitCompareArrows,
    title: "Environment comparison",
    description: "See exactly what's missing in staging or production before a deploy fails because of it.",
    preview: (
      <div className="space-y-2">
        <EnvironmentCard name="Staging" healthy={5} total={7} />
        <EnvironmentCard name="Production" healthy={7} total={7} />
      </div>
    ),
  },
  {
    icon: Terminal,
    title: "CI-ready CLI",
    description:
      "envsync check runs fully offline and returns a non-zero exit code on critical issues.",
    span: "lg:col-span-2",
    preview: (
      <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 font-mono text-xs leading-relaxed">
        <span className="text-muted-foreground">$ </span>envsync check
        {"\n"}
        <span className="text-success">✓</span> 24 variables detected — Configuration Health:{" "}
        <span className="text-warning">74/100</span>
      </pre>
    ),
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Know before you deploy
          </h2>
          <p className="mt-3 text-muted-foreground">
            Not a secrets manager. A validation layer that tells you what&apos;s broken, and where.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40",
                feature.span
              )}
            >
              <div
                className={cn(
                  "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
                  feature.accent === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
              <div className="mt-4">{feature.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
