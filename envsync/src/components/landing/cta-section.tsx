import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="border-t border-border">
      <div className="relative mx-auto max-w-5xl overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[360px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[110px]"
          aria-hidden
        />
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Catch it before your users do.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Connect a repository in under two minutes. Free for one repository, forever.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/signup" className={cn(buttonClasses("default", "lg"), "gap-2")}>
            Connect GitHub — Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
