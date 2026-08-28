import { prisma } from "@/lib/prisma";
import { computeHealthScore, type ScorableIssue } from "./scoring";

export async function getRepositoryDashboardData(repositoryId: string) {
  const repository = await prisma.repository.findUniqueOrThrow({
    where: { id: repositoryId },
    include: {
      environments: { include: { variableStates: true }, orderBy: { createdAt: "asc" } },
      environmentVariables: { include: { usages: true } },
      scans: { orderBy: { startedAt: "desc" }, take: 1 },
    },
  });

  // Coverage only makes sense for variables the app currently references —
  // a stale/unused declaration shouldn't also count as "missing everywhere"
  // (see environment-sync.ts, which applies the same filter).
  const activeVariables = repository.environmentVariables.filter((v) => v.usages.length > 0);
  const activeVariableIds = new Set(activeVariables.map((v) => v.id));

  const [openIssues, scoreHistoryRaw] = await Promise.all([
    prisma.issue.findMany({
      where: { repositoryId, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { environmentVariable: { include: { usages: true } }, environment: true },
    }),
    prisma.scan.findMany({
      where: { repositoryId, healthScore: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 20,
      select: { startedAt: true, healthScore: true },
    }),
  ]);

  // Chart reads left-to-right chronologically; the query above needed "desc" to take the most recent 20.
  const scoreHistory = scoreHistoryRaw
    .slice()
    .reverse()
    .map((scan) => ({ date: scan.startedAt, score: scan.healthScore! }));

  const scorable: ScorableIssue[] = openIssues.map((issue) => ({
    type: issue.type,
    severity: issue.severity,
    environmentKind: issue.environment?.kind,
  }));

  const totalChecks = Math.max(1, activeVariables.length * Math.max(1, repository.environments.length));
  const { score, breakdown, critical, warning, healthy } = computeHealthScore(scorable, totalChecks);

  const environments = repository.environments.map((env) => ({
    id: env.id,
    name: env.name,
    kind: env.kind,
    configured: env.variableStates.filter((s) => s.isConfigured && activeVariableIds.has(s.environmentVariableId))
      .length,
    total: activeVariables.length,
  }));

  return {
    repository,
    lastScan: repository.scans[0] ?? null,
    score,
    breakdown,
    critical,
    warning,
    healthy,
    environments,
    issues: openIssues,
    scoreHistory,
  };
}

export type RepositoryDashboardData = Awaited<ReturnType<typeof getRepositoryDashboardData>>;
