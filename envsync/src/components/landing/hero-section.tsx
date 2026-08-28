import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="bg-grid pointer-events-none absolute inset-0 -z-20"
        style={{ maskImage: "radial-gradient(ellipse 60% 55% at 50% 0%, black, transparent)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]"
        aria-hidden
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pb-24 pt-24 text-center sm:pt-32">
        <Badge variant="muted" className="border border-border">
          Configuration intelligence, not another secrets manager
        </Badge>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Your SaaS works.{" "}
          <span className="bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Until one environment variable doesn&apos;t.
          </span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          EnvSync automatically discovers, compares, and validates your application&apos;s
          configuration across local, staging, and production — before deployment, not after.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/signup" className={cn(buttonClasses("default", "lg"), "gap-2")}>
            Connect GitHub — Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#preview" className={cn(buttonClasses("outline", "lg"))}>
            See it in action
          </Link>
        </div>

        <p className="pt-1 text-xs text-muted-foreground">
          Free for one repository. No credit card. Never uploads your secret values.
        </p>
      </div>
    </section>
  );
}
