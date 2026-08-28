import { withApiAuth, requireOrgRepository } from "@/lib/api-auth";
import { getRepositoryDashboardData } from "@/lib/scan/dashboard-data";

export const GET = withApiAuth<[{ params: Promise<{ repositoryId: string }> }]>(
  async (_request, { organizationId }, { params }) => {
    const { repositoryId } = await params;
    await requireOrgRepository(organizationId, repositoryId);

    const data = await getRepositoryDashboardData(repositoryId);

    return Response.json({
      data: {
        id: data.repository.id,
        name: data.repository.name,
        fullName: data.repository.fullName,
        defaultBranch: data.repository.defaultBranch,
        isPrivate: data.repository.isPrivate,
        healthScore: data.score,
        scoreBreakdown: data.breakdown,
        issueCounts: { critical: data.critical, warning: data.warning, healthy: data.healthy },
        environments: data.environments.map((env) => ({
          id: env.id,
          name: env.name,
          kind: env.kind,
          configured: env.configured,
          total: env.total,
        })),
        lastScanAt: data.repository.lastScanAt,
      },
    });
  }
);
