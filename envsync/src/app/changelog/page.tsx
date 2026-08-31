import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata: Metadata = { title: "Changelog · EnvSync" };

interface Release {
  version: string;
  date: string;
  entries: string[];
}

const RELEASES: Release[] = [
  {
    version: "0.5.0",
    date: "August 28, 2026",
    entries: [
      "Live Vercel sync — Production/Staging/Development coverage now reads directly from your Vercel project instead of manual checkboxes, and re-syncs on every scan.",
      "Supabase is now the default database for self-hosted deployments, with Prisma's pooled + direct connection pattern.",
      "Landing page now explains explicitly how EnvSync differs from GitHub's secret scanning.",
    ],
  },
  {
    version: "0.4.0",
    date: "August 28, 2026",
    entries: [
      "Mobile responsiveness overhaul — fixed the dashboard shell layout bug causing horizontal overflow on every page below desktop width.",
      "Provider knowledge base expanded to 500+ real vendors across 22 categories, replacing the original 10-vendor keyword list.",
      "New /docs section: introduction, quickstart, core concepts, GitHub permissions, API & SDK reference, FAQ.",
      "API keys: create and revoke hashed keys from Settings, shown in plaintext exactly once.",
      "Public REST API (/api/v1) and the @envsync/sdk TypeScript client.",
      "EnvSync Copilot upgraded with vendor-aware, variable-specific, and score-trend questions — still fully offline, no LLM call.",
    ],
  },
  {
    version: "0.3.0",
    date: "August 28, 2026",
    entries: [
      "Full Issues page with status/severity filters and ignore/reopen actions.",
      "Configuration Health score history chart.",
      "Team management: invite by email, change role, remove members, seat limits per plan.",
    ],
  },
  {
    version: "0.2.0",
    date: "August 28, 2026",
    entries: [
      "Rebuilt the dashboard as a proper app shell: sidebar navigation, command palette (⌘K), toast notifications.",
      "Production-grade landing page redesign.",
    ],
  },
  {
    version: "0.1.0",
    date: "August 28, 2026",
    entries: [
      "Initial release: repository scanner, .env.example diffing, secret exposure detection, transparent Configuration Health score, GitHub OAuth connect flow, environment management, and the offline envsync CLI.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
          <p className="text-muted-foreground">What&apos;s shipped, in order.</p>
        </div>

        <div className="space-y-10 border-l border-border pl-6">
          {RELEASES.map((release) => (
            <div key={release.version} className="relative">
              <div className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-semibold tracking-tight">v{release.version}</h2>
                <span className="text-sm text-muted-foreground">{release.date}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {release.entries.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
