import { prisma } from "@/lib/prisma";
import { computeEnvironmentCoverage } from "./environment-coverage";

/**
 * Recomputes MISSING_VARIABLE issues for a repository from its current
 * Environment/EnvironmentVariableState configuration. Called after a scan
 * (new variables may exist) and after any environment edit (state can
 * change without a rescan) so the dashboard is always current.
 */
export async function syncEnvironmentIssues(repositoryId: string) {
  const [variables, environments, states] = await Promise.all([
    // Only variables with at least one current usage count toward "required in
    // every environment" — a stale/unused declaration shouldn't also be
    // flagged as missing everywhere (that's UNUSED_VARIABLE's job instead).
    prisma.environmentVariable.findMany({
      where: { repositoryId, usages: { some: {} } },
      select: { id: true, key: true },
    }),
    prisma.environment.findMany({ where: { repositoryId }, select: { id: true, name: true, kind: true } }),
    prisma.environmentVariableState.findMany({
      where: { environment: { repositoryId } },
      select: { environmentId: true, environmentVariableId: true, isConfigured: true },
    }),
  ]);

  const coverage = computeEnvironmentCoverage(variables, environments, states);

  await prisma.issue.updateMany({
    where: { repositoryId, type: "MISSING_VARIABLE", status: "OPEN" },
    data: { status: "RESOLVED" },
  });

  if (coverage.missing.length > 0) {
    await prisma.issue.createMany({
      data: coverage.missing.map((m) => ({
        repositoryId,
        type: "MISSING_VARIABLE" as const,
        severity:
          m.environmentKind === "PRODUCTION" || m.environmentKind === "STAGING"
            ? ("CRITICAL" as const)
            : ("WARNING" as const),
        title: `"${m.variableKey}" is missing in ${m.environmentName}`,
        description: `${m.variableKey} is required by the application but isn't marked as configured in ${m.environmentName}.`,
        environmentVariableId: m.variableId,
        environmentId: m.environmentId,
      })),
    });
  }

  return coverage;
}
