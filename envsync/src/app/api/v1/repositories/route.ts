import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth";

export const GET = withApiAuth(async (_request, { organizationId }) => {
  const repositories = await prisma.repository.findMany({
    where: { organizationId },
    include: { scans: { orderBy: { startedAt: "desc" }, take: 1, select: { healthScore: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    data: repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      defaultBranch: repo.defaultBranch,
      isPrivate: repo.isPrivate,
      healthScore: repo.scans[0]?.healthScore ?? null,
      lastScanAt: repo.lastScanAt,
      createdAt: repo.createdAt,
    })),
  });
});
