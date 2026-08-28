import { Check, Lock, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VercelConnectionCard } from "@/components/dashboard/vercel-connection-card";
import { cn } from "@/lib/utils";
import {
  createEnvironmentAction,
  deleteEnvironmentAction,
  setVariableStateAction,
} from "./actions";

const KIND_OPTIONS = ["LOCAL", "DEVELOPMENT", "STAGING", "PRODUCTION"] as const;

export default async function EnvironmentsPage({
  params,
}: {
  params: Promise<{ repositoryId: string }>;
}) {
  const { repositoryId } = await params;

  const [environments, variables, vercelConnection] = await Promise.all([
    prisma.environment.findMany({
      where: { repositoryId },
      include: { variableStates: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.environmentVariable.findMany({ where: { repositoryId }, orderBy: { key: "asc" } }),
    prisma.vercelConnection.findUnique({ where: { repositoryId } }),
  ]);

  const stateFor = (environmentId: string, variableId: string) =>
    environments
      .find((e) => e.id === environmentId)
      ?.variableStates.find((s) => s.environmentVariableId === variableId)?.isConfigured ?? false;

  // Vercel sync owns Production/Staging/Development once connected — Local
  // has no Vercel equivalent, so it stays manually toggled either way.
  const autoSyncedKinds = vercelConnection ? new Set(["PRODUCTION", "STAGING", "DEVELOPMENT"]) : new Set();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deploy platform sync</CardTitle>
        </CardHeader>
        <CardContent>
          <VercelConnectionCard
            repositoryId={repositoryId}
            connected={!!vercelConnection}
            lastSyncedAt={vercelConnection?.lastSyncedAt?.toISOString() ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add an environment</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createEnvironmentAction.bind(null, repositoryId)}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <input
                name="name"
                required
                placeholder="Staging"
                className="block rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Kind</label>
              <select
                name="kind"
                className="block rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              >
                {KIND_OPTIONS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Source file (optional)</label>
              <input
                name="sourceFile"
                placeholder=".env.staging"
                className="block rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit">Add environment</Button>
          </form>
        </CardContent>
      </Card>

      {variables.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No variables detected yet — run a scan first.
        </p>
      ) : environments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add an environment above to start tracking coverage.</p>
      ) : (
        <Card className="overflow-x-auto">
          <CardContent className="p-0">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">Variable</th>
                  {environments.map((env) => (
                    <th key={env.id} className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {env.name}
                        {autoSyncedKinds.has(env.kind) && (
                          <Lock className="h-3 w-3 text-muted-foreground" aria-label="Synced from Vercel" />
                        )}
                      </div>
                      {autoSyncedKinds.has(env.kind) ? (
                        <div className="text-[10px] font-normal normal-case text-muted-foreground">
                          synced from Vercel
                        </div>
                      ) : (
                        <form action={deleteEnvironmentAction.bind(null, repositoryId, env.id)}>
                          <button
                            type="submit"
                            className="text-[10px] font-normal normal-case text-muted-foreground underline"
                          >
                            remove
                          </button>
                        </form>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variables.map((variable) => (
                  <tr key={variable.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-xs">{variable.key}</td>
                    {environments.map((env) => {
                      const configured = stateFor(env.id, variable.id);
                      const auto = autoSyncedKinds.has(env.kind);
                      const badge = (
                        <span
                          aria-label={configured ? "Configured" : "Not configured"}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                            configured
                              ? "border-success bg-success/10 text-success"
                              : "border-destructive bg-destructive/10 text-destructive"
                          )}
                        >
                          {configured ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        </span>
                      );
                      return (
                        <td key={env.id} className="p-3 text-center">
                          {auto ? (
                            badge
                          ) : (
                            <form
                              action={setVariableStateAction.bind(
                                null,
                                repositoryId,
                                env.id,
                                variable.id,
                                !configured
                              )}
                            >
                              <button type="submit">{badge}</button>
                            </form>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
