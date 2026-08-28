import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { DocsNav } from "@/components/docs/docs-nav";

export const metadata: Metadata = {
  title: {
    template: "%s · EnvSync Docs",
    default: "Documentation · EnvSync",
  },
  description: "Guides and reference for EnvSync — environment configuration intelligence for SaaS teams.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 py-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-12">
        <DocsNav />
        <main className="min-w-0 pt-6 lg:pt-0">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
