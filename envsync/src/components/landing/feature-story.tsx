import { AlertTriangle } from "lucide-react";
import { HealthGauge } from "@/components/health-gauge";
import { EnvironmentCard } from "@/components/environment-card";
import { FindingItem } from "@/components/finding-item";
import { WindowChrome } from "./window-chrome";

interface Story {
  eyebrow: string;
  headline: string;
  barClassName: string;
  preview: React.ReactNode;
}

const STORIES: Story[] = [
  {
    eyebrow: "Repository scanner",
    headline: "Finds every environment variable your code actually reads — before you have to grep for it yourself.",
    barClassName: "bg-gradient-to-b from-primary to-violet-400",
    preview: (
      <WindowChrome url="src/lib/stripe.ts">
        <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
          <span className="text-muted-foreground">1</span>{"  "}
          <span className="text-muted-foreground">import Stripe from &quot;stripe&quot;;</span>
          {"\n"}
          <span className="text-muted-foreground">2</span>
          {"\n"}
          <span className="text-muted-foreground">3</span>
          {"  "}const key = <span className="rounded bg-primary/20 px-1 text-primary">process.env.STRIPE_SECRET_KEY</span>;
          {"\n"}
          <span className="text-muted-foreground">4</span>
          {"  "}const stripe = new Stripe(key);
        </pre>
        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Detected <code className="rounded bg-muted px-1 py-0.5 text-foreground">STRIPE_SECRET_KEY</code> — classified as Stripe
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: "Health score",
    headline: "One score you can put in a status update, with every point accounted for.",
    barClassName: "bg-gradient-to-b from-success to-emerald-300",
    preview: (
      <WindowChrome url="envsync.dev/dashboard/acme-saas">
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Configuration Health</p>
            <HealthGauge score={82} className="mt-2" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
              <span className="text-muted-foreground">All critical variables documented</span>
              <span className="font-mono text-success">+10</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
              <span className="text-muted-foreground">Missing staging variable ×2</span>
              <span className="font-mono text-destructive">−20</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5">
              <span className="text-muted-foreground">Possibly unused variable</span>
              <span className="font-mono text-destructive">−2</span>
            </div>
          </div>
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: "Live Vercel sync",
    headline: "Reads what's really deployed on Vercel — not just what's committed to git.",
    barClassName: "bg-gradient-to-b from-sky-400 to-primary",
    preview: (
      <WindowChrome url="envsync.dev/dashboard/acme-saas/environments">
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-muted-foreground">Connected to Vercel — synced 2 min ago</span>
          </div>
          <EnvironmentCard name="Production" healthy={7} total={7} />
          <EnvironmentCard name="Preview" healthy={5} total={7} />
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: ".env.example intelligence",
    headline: "Catches the variable a teammate added and forgot to document.",
    barClassName: "bg-gradient-to-b from-warning to-amber-300",
    preview: (
      <WindowChrome url=".env.example">
        <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
          DATABASE_URL=
          {"\n"}
          NEXT_PUBLIC_API_URL=
          {"\n"}
          <span className="text-muted-foreground">STRIPE_SECRET_KEY=</span>
        </pre>
        <div className="flex items-start gap-2 border-t border-border bg-warning/10 px-5 py-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">STRIPE_WEBHOOK_SECRET</code> is used in
            code but missing from this file
          </span>
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: "Secret exposure detection",
    headline: "Flags a hardcoded key before it reaches a public commit.",
    barClassName: "bg-gradient-to-b from-destructive to-rose-400",
    preview: (
      <WindowChrome url="config/payment.js">
        <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
          <span className="text-muted-foreground">12</span>
          {"  "}const client = new Stripe(
          {"\n"}
          <span className="text-muted-foreground">13</span>
          {"  "}
          {"  "}
          <span className="rounded bg-destructive/20 px-1 text-destructive">
            &quot;sk_live_51NxT2eKjP9s8...&quot;
          </span>
          {"\n"}
          <span className="text-muted-foreground">14</span>
          {"  "});
        </pre>
        <div className="border-t border-border bg-destructive/5 px-5 py-3">
          <FindingItem severity="critical">
            <span className="font-mono text-xs">sk_live_••••••••••••9X2A</span> — Stripe secret key, hardcoded
          </FindingItem>
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: "Environment comparison",
    headline: "See exactly what's missing in staging before a deploy fails because of it.",
    barClassName: "bg-gradient-to-b from-primary to-fuchsia-400",
    preview: (
      <WindowChrome url="envsync.dev/dashboard/acme-saas/environments">
        <div className="space-y-2 p-6">
          <EnvironmentCard name="Local" healthy={7} total={7} />
          <EnvironmentCard name="Staging" healthy={5} total={7} />
          <EnvironmentCard name="Production" healthy={7} total={7} />
        </div>
      </WindowChrome>
    ),
  },
  {
    eyebrow: "CI-ready CLI",
    headline: "Runs entirely offline, and exits non-zero the moment something critical breaks.",
    barClassName: "bg-gradient-to-b from-foreground to-muted-foreground",
    preview: (
      <WindowChrome title="~/acme-saas — zsh">
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
          <span className="text-muted-foreground">$ </span>npx envsync check{"\n\n"}
          <span className="text-success">✓</span> 24 variables detected{"\n"}
          <span className="text-success">✓</span> 21 variables documented{"\n"}
          <span className="text-destructive">✗</span> 1 possible secret exposure{"\n\n"}
          Configuration Health: <span className="text-warning">74/100</span>
          {"\n\n"}
          <span className="text-destructive">✗ 1 critical configuration issue found.</span>
        </pre>
      </WindowChrome>
    ),
  },
];

export function FeatureStory() {
  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Know before you deploy
          </h2>
          <p className="mt-3 text-muted-foreground">
            Not a secrets manager. A validation layer that tells you what&apos;s broken, and where.
          </p>
        </div>

        <div className="mt-20 space-y-20">
          {STORIES.map((story) => (
            <div key={story.eyebrow}>
              <div className="flex gap-5">
                <div className={`w-1 shrink-0 rounded-full ${story.barClassName}`} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {story.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    {story.headline}
                  </h3>
                </div>
              </div>
              <div className="mt-8">{story.preview}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
