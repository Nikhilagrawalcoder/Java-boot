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
    <nav className="flex gap-1 border-b border-border text-sm">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 transition-colors",
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
