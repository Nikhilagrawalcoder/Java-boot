"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  connectVercelAction,
  disconnectVercelAction,
  syncVercelNowAction,
  finalizeVercelConnectionAction,
  cancelPendingVercelConnectionAction,
} from "@/app/dashboard/[repositoryId]/environments/vercel-actions";
import type { VercelProjectSummary } from "@/lib/vercel";

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
  oauthConfigured,
  pendingProjects,
}: {
  repositoryId: string;
  connected: boolean;
  lastSyncedAt: string | null;
  oauthConfigured: boolean;
  pendingProjects: VercelProjectSummary[] | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedProject, setSelectedProject] = useState(pendingProjects?.[0]?.id ?? "");

  function handleConfirmProject() {
    if (!selectedProject) return;
    startTransition(() => {
      const promise = finalizeVercelConnectionAction(repositoryId, selectedProject);
      toast.promise(promise, {
        loading: "Connecting to Vercel...",
        success: "Connected — Production/Preview/Development now sync automatically",
        error: (err) => (err instanceof Error ? err.message : "Couldn't connect to Vercel"),
      });
    });
  }

  function handleCancelPick() {
    startTransition(() => {
      cancelPendingVercelConnectionAction(repositoryId);
    });
  }

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

  const description = (
    <p className="text-xs text-muted-foreground">
      Connect a Vercel project to sync Production, Preview, and Development coverage automatically from
      what&apos;s actually deployed — no manual checkboxes, and it stays current on every scan. EnvSync only
      ever reads variable <em>names</em>, never values.
    </p>
  );

  if (connected) {
    return (
      <div className="space-y-3">
        {description}
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
      </div>
    );
  }

  if (pendingProjects) {
    return (
      <div className="space-y-3">
        {description}
        <div className="space-y-3 rounded-md border border-border p-4">
          <p className="text-sm font-medium">Vercel connected — pick a project</p>
          {pendingProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects were visible to that account. Create one on Vercel first, then reconnect.
            </p>
          ) : (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            >
              {pendingProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmProject}
              disabled={isPending || pendingProjects.length === 0}
            >
              {isPending ? "Connecting..." : "Connect this project"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCancelPick} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tokenForm = (
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
      <Button type="submit" variant={oauthConfigured ? "outline" : "default"} disabled={isPending}>
        {isPending ? "Connecting..." : "Connect"}
      </Button>
    </form>
  );

  return (
    <div className="space-y-3">
      {description}

      {oauthConfigured ? (
        <>
          <a href={`/api/vercel/connect?repositoryId=${repositoryId}`}>
            <Button type="button">Connect with Vercel</Button>
          </a>
          <details>
            <summary className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4">
              Or connect with an API token instead
            </summary>
            <div className="mt-3">{tokenForm}</div>
          </details>
        </>
      ) : (
        tokenForm
      )}
    </div>
  );
}
