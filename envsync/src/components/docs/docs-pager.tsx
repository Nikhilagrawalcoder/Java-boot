import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDocsPager } from "@/lib/docs-nav";

export function DocsPager({ currentHref }: { currentHref: string }) {
  const { prev, next } = getDocsPager(currentHref);
  if (!prev && !next) return null;

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>
            <span className="block text-xs text-muted-foreground">Previous</span>
            {prev.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-right text-sm text-muted-foreground hover:text-foreground"
        >
          <span>
            <span className="block text-xs text-muted-foreground">Next</span>
            {next.label}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
