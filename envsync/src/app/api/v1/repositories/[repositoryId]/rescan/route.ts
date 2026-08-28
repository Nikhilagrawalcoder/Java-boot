import { ApiError, withApiAuth, requireOrgRepository } from "@/lib/api-auth";
import { runScan } from "@/lib/scan/pipeline";

export const POST = withApiAuth<[{ params: Promise<{ repositoryId: string }> }]>(
  async (_request, { organizationId }, { params }) => {
    const { repositoryId } = await params;
    await requireOrgRepository(organizationId, repositoryId);

    try {
      const result = await runScan(repositoryId);
      return Response.json({ data: { status: "completed", scanId: result.scanId, healthScore: result.healthScore } });
    } catch (error) {
      throw new ApiError(502, error instanceof Error ? error.message : "Scan failed.");
    }
  }
);
