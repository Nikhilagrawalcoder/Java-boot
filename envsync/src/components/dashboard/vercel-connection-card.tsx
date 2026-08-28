"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  connectVercelAction,
  disconnectVercelAction,
  syncVercelNowAction,
} from "@/app/dashboard/[repositoryId]/environments/vercel-actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VercelConnectionCard({
  repositoryId,
  connected,
  lastSyncedAt,
}: {
  repositoryId: string;
  connected: boolean;
  lastSyncedAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleConnect(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      const promise = connectVercelAction(repositoryId, formData);
      toast.promise(promise, {
        loading: "Connecting to Vercel...",
        success: "Connected — Production/Staging/Development now sync automatically",
        error: (err) => (err instanceof Error ? err.message : "Couldn't connect to Vercel"),
      });
    });
  }

  function handleSyncNow() {
    startTransition(() => {
      const promise = syncVercelNowAction(repositoryId);
      toast.promise(promise, {
        loading: "Syncing from Vercel...",
        success: "Synced",
        error: (err) => (err instanceof Error ? err.message : "Sync failed"),
      });
    });
  }

  function handleDisconnect() {
    if (!window.confirm("Disconnect Vercel? Production/Staging/Development coverage goes back to manual toggles.")) return;
    startTransition(() => {
      const promise = disconnectVercelAction(repositoryId);
      toast.promise(promise, { loading: "Disconnecting...", success: "Disconnected", error: "Something went wrong" });
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Connect a Vercel project to sync Production, Preview, and Development coverage automatically from
        what&apos;s actually deployed — no manual checkboxes, and it stays current on every scan. EnvSync only
        ever reads variable <em>names</em>, never values.
      </p>

      {connected ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
          <div>
            <Badge variant="success">Connected</Badge>
            <p className="mt-1 text-xs text-muted-foreground">
              {lastSyncedAt ? `Last synced ${formatDate(lastSyncedAt)}` : "Not synced yet"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSyncNow} disabled={isPending}>
              {isPending ? "Syncing..." : "Sync now"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleDisconnect} disabled={isPending}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Vercel API token</label>
            <input
              name="token"
              type="password"
              required
              placeholder="Personal or team token"
              className="block w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Project ID</label>
            <input
              name="projectId"
              required
              placeholder="prj_xxxxxxxx"
              className="block w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Connecting..." : "Connect"}
          </Button>
        </form>
      )}
    </div>
  );
}
