import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { fetchVercelProjectEnv } from "@/lib/vercel";
import { syncEnvironmentIssues } from "./environment-sync";
import type { EnvironmentKind } from "@prisma/client";

const TARGET_TO_KIND: Record<string, EnvironmentKind> = {
  production: "PRODUCTION",
  preview: "STAGING",
  development: "DEVELOPMENT",
};

const KIND_LABELS: Record<EnvironmentKind, string> = {
  PRODUCTION: "Production",
  STAGING: "Staging",
  DEVELOPMENT: "Development",
  LOCAL: "Local",
};

export interface VercelSyncResult {
  synced: boolean;
  error?: string;
}

/**
 * Pulls the live list of env var *names* configured on Vercel and overwrites
 * EnvironmentVariableState for the matching Production/Staging/Development
 * environments — ground truth from the actual deploy platform, replacing
 * manual checkboxes. Creates those environments if they don't exist yet.
 *
 * Fails soft: if the token or project id is no longer valid, this returns
 * an error instead of throwing, so a Vercel hiccup never blocks a code scan.
 */
export async function syncFromVercel(repositoryId: string): Promise<VercelSyncResult> {
  const connection = await prisma.vercelConnection.findUnique({ where: { repositoryId } });
  if (!connection) return { synced: false };

  let envVars;
  try {
    const token = decryptSecret(connection.accessTokenEncrypted);
    envVars = await fetchVercelProjectEnv(token, connection.vercelProjectId, connection.vercelTeamId);
  } catch (error) {
    return { synced: false, error: error instanceof Error ? error.message : "Vercel sync failed." };
  }

  const variables = await prisma.environmentVariable.findMany({
    where: { repositoryId, usages: { some: {} } },
    select: { id: true, key: true },
  });

  const kindsPresent = new Set<EnvironmentKind>();
  for (const env of envVars) {
    for (const target of env.targets) {
      const kind = TARGET_TO_KIND[target];
      if (kind) kindsPresent.add(kind);
    }
  }

  for (const kind of kindsPresent) {
    await prisma.environment.upsert({
      where: { repositoryId_kind: { repositoryId, kind } },
      create: { repositoryId, kind, name: KIND_LABELS[kind] },
      update: {},
    });
  }

  const environments = await prisma.environment.findMany({
    where: { repositoryId, kind: { in: Array.from(kindsPresent) } },
  });

  // Ground truth from Vercel replaces prior state entirely for these
  // environments — a variable removed from Vercel should show as missing
  // again, not linger as "configured" from a stale manual toggle.
  for (const environment of environments) {
    const configuredKeys = new Set(
      envVars.filter((e) => e.targets.some((t) => TARGET_TO_KIND[t] === environment.kind)).map((e) => e.key)
    );

    await Promise.all(
      variables.map((variable) =>
        prisma.environmentVariableState.upsert({
          where: {
            environmentId_environmentVariableId: {
              environmentId: environment.id,
              environmentVariableId: variable.id,
            },
          },
          create: {
            environmentId: environment.id,
            environmentVariableId: variable.id,
            isConfigured: configuredKeys.has(variable.key),
          },
          update: { isConfigured: configuredKeys.has(variable.key) },
        })
      )
    );
  }

  await prisma.vercelConnection.update({ where: { repositoryId }, data: { lastSyncedAt: new Date() } });
  await syncEnvironmentIssues(repositoryId);

  return { synced: true };
}
