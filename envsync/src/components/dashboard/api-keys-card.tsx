"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { createApiKeyAction, revokeApiKeyAction } from "@/app/dashboard/settings/api-key-actions";

export interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function RevokeButton({ apiKeyId }: { apiKeyId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Revoke this API key? Any integration using it will stop working immediately.")) return;
    startTransition(() => {
      const promise = revokeApiKeyAction(apiKeyId);
      toast.promise(promise, {
        loading: "Revoking...",
        success: "API key revoked",
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Revoking..." : "Revoke"}
    </Button>
  );
}

export function ApiKeysCard({ keys, canManage }: { keys: ApiKeyRow[]; canManage: boolean }) {
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    startTransition(() => {
      const promise = createApiKeyAction(name).then(({ plaintext }) => {
        setRevealed(plaintext);
        setName("");
      });
      toast.promise(promise, {
        loading: "Creating key...",
        success: "API key created",
        error: (err) => (err instanceof Error ? err.message : "Something went wrong"),
      });
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Use API keys to authenticate the EnvSync SDK or your own scripts against the{" "}
        <code className="rounded bg-muted px-1 py-0.5">/api/v1</code> REST API. Keys grant read access
        to this organization&apos;s repositories, scores, and issues — never to secret values, which
        EnvSync never stores in the first place.
      </p>

      {revealed && (
        <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Copy this key now — you won&apos;t be able to see it again
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md bg-background px-3 py-2 font-mono text-xs">
              {revealed}
            </code>
            <CopyButton text={revealed} />
          </div>
          <button
            type="button"
            onClick={() => setRevealed(null)}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Done, dismiss
          </button>
        </div>
      )}

      {keys.length > 0 && (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {key.keyPrefix}••••••••
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(key.createdAt)}
                  {key.lastUsedAt ? ` · Last used ${formatDate(key.lastUsedAt)}` : " · Never used"}
                </p>
              </div>
              <div className="shrink-0">
                {key.revokedAt ? (
                  <Badge variant="muted">Revoked</Badge>
                ) : canManage ? (
                  <RevokeButton apiKeyId={key.id} />
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CI pipeline"
            className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create key"}
          </Button>
        </form>
      )}
    </div>
  );
}
