"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

export function DocsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: horizontal scrollable strip, flat list (no section headings — keeps it compact). */}
      <nav className="-mx-6 flex gap-1 overflow-x-auto border-b border-border px-6 pb-3 text-sm lg:hidden">
        {DOCS_NAV.flatMap((section) => section.items).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 transition-colors",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: sticky vertical sidebar, grouped by section. */}
      <nav className="hidden lg:sticky lg:top-24 lg:block lg:space-y-6 lg:self-start">
        {DOCS_NAV.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {section.title}
            </p>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
