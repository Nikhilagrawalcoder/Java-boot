"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SidebarContent, type SidebarRepository } from "./sidebar-content";
import { CommandPalette } from "./command-palette";

export function DashboardShell({
  repositories,
  userEmail,
  planLabel,
  signOutAction,
  children,
}: {
  repositories: SidebarRepository[];
  userEmail: string;
  planLabel: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeRepositoryId = repositories.find((r) => pathname?.startsWith(`/dashboard/${r.id}`))?.id;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border lg:flex">
        <SidebarContent
          repositories={repositories}
          userEmail={userEmail}
          planLabel={planLabel}
          signOutAction={signOutAction}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </aside>

      <div className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] border-r border-border bg-background">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              repositories={repositories}
              userEmail={userEmail}
              planLabel={planLabel}
              signOutAction={signOutAction}
              onOpenPalette={() => {
                setMobileOpen(false);
                setPaletteOpen(true);
              }}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:py-10">{children}</div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        repositories={repositories}
        activeRepositoryId={activeRepositoryId}
      />
    </div>
  );
}
