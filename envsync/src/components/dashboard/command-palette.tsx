"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Command } from "cmdk";
import { toast } from "sonner";
import {
  AlertCircle,
  FolderGit2,
  Gauge,
  GitCompareArrows,
  MessageCircle,
  Plus,
  RefreshCw,
  Settings,
  Terminal,
  Users,
} from "lucide-react";
import type { SidebarRepository } from "./sidebar-content";
import { rescanAction } from "@/app/dashboard/[repositoryId]/actions";

export function CommandPalette({
  open,
  onOpenChange,
  repositories,
  activeRepositoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositories: SidebarRepository[];
  activeRepositoryId?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function go(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  function runRescan() {
    onOpenChange(false);
    if (!activeRepositoryId) return;
    const promise = rescanAction(activeRepositoryId);
    toast.promise(promise, {
      loading: "Scanning repository...",
      success: "Scan complete",
      error: "Scan failed — check the server logs",
    });
    startTransition(() => {});
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-24 z-[100] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
      shouldFilter
    >
      <div className="flex items-center border-b border-border px-4">
        <Command.Input
          autoFocus
          placeholder="Type a command or search..."
          className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          esc
        </kbd>
      </div>

      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="p-6 text-center text-sm text-muted-foreground">
          No results found.
        </Command.Empty>

        {repositories.length > 0 && (
          <Command.Group
            heading="Repositories"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {repositories.map((repo) => (
              <Command.Item
                key={repo.id}
                onSelect={() => go(`/dashboard/${repo.id}`)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
              >
                <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                {repo.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {activeRepositoryId && (
          <Command.Group
            heading="Navigate"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <Command.Item
              onSelect={() => go(`/dashboard/${activeRepositoryId}`)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
            >
              <Gauge className="h-4 w-4 text-muted-foreground" />
              Overview
            </Command.Item>
            <Command.Item
              onSelect={() => go(`/dashboard/${activeRepositoryId}/issues`)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
            >
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Issues
            </Command.Item>
            <Command.Item
              onSelect={() => go(`/dashboard/${activeRepositoryId}/environments`)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
            >
              <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
              Environments
            </Command.Item>
            <Command.Item
              onSelect={() => go(`/dashboard/${activeRepositoryId}/actions`)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
            >
              <Terminal className="h-4 w-4 text-muted-foreground" />
              CI setup
            </Command.Item>
            <Command.Item
              onSelect={() => go(`/dashboard/${activeRepositoryId}/copilot`)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              Copilot
            </Command.Item>
            {activeRepositoryId && (
              <Command.Item
                onSelect={runRescan}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                Rescan repository
              </Command.Item>
            )}
          </Command.Group>
        )}

        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <Command.Item
            onSelect={() => go("/dashboard/connect")}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            Connect a repository
          </Command.Item>
          <Command.Item
            onSelect={() => go("/dashboard/team")}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            Team
          </Command.Item>
          <Command.Item
            onSelect={() => go("/dashboard/settings")}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Settings
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
