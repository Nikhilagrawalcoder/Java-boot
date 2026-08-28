import {
  FileSearch,
  FileCheck2,
  ShieldAlert,
  GitCompareArrows,
  Gauge,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
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
  },
  {
    icon: Gauge,
    title: "Health score",
    description: "One transparent 0–100 score, with a visible +/- breakdown of every factor.",
  },
  {
    icon: FileCheck2,
    title: ".env.example intelligence",
    description:
      "Catches variables used in code but undocumented, and entries that are declared but no longer used.",
  },
  {
    icon: ShieldAlert,
    title: "Secret exposure detection",
    description:
      "Flags likely committed secrets — Stripe, AWS, GitHub tokens, private keys — with masked previews only.",
    accent: "destructive",
  },
  {
    icon: GitCompareArrows,
    title: "Environment comparison",
    description: "See exactly what's missing in staging or production before a deploy fails because of it.",
  },
  {
    icon: Terminal,
    title: "CI-ready CLI",
    description:
      "envsync check runs fully offline and returns a non-zero exit code on critical issues.",
    span: "lg:col-span-2",
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
