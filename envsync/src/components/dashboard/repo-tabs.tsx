"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function RepoTabs({ repositoryId }: { repositoryId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${repositoryId}`;

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/issues`, label: "Issues" },
    { href: `${base}/environments`, label: "Environments" },
    { href: `${base}/actions`, label: "CI setup" },
    { href: `${base}/copilot`, label: "Copilot" },
  ];

  return (
    <nav className="-mx-6 flex gap-1 overflow-x-auto border-b border-border px-6 text-sm sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
