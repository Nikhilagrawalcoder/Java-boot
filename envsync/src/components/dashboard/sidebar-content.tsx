"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, Plus, Search, Settings, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SidebarRepository {
  id: string;
  name: string;
}

export function SidebarContent({
  repositories,
  userEmail,
  planLabel,
  signOutAction,
  onOpenPalette,
  onNavigate,
}: {
  repositories: SidebarRepository[];
  userEmail: string;
  planLabel: string;
  signOutAction: () => Promise<void>;
  onOpenPalette: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-1 px-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Repositories
        </p>
        <nav className="space-y-0.5">
          {repositories.map((repo) => {
            const active = pathname?.startsWith(`/dashboard/${repo.id}`);
            return (
              <Link
                key={repo.id}
                href={`/dashboard/${repo.id}`}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <FolderGit2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{repo.name}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard/connect"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Connect repository
          </Link>
        </nav>
      </div>

      <div className="space-y-0.5 border-t border-border p-3">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </span>
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <Link
          href="/dashboard/team"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname === "/dashboard/team"
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Team
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{userEmail}</p>
              <p className="text-[11px] text-muted-foreground">{planLabel} plan</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <form action={signOutAction} className="mt-2">
          <Button variant="outline" size="sm" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
