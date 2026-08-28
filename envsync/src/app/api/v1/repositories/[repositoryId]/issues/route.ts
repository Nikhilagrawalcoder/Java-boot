import { prisma } from "@/lib/prisma";
import { withApiAuth, requireOrgRepository } from "@/lib/api-auth";
import type { IssueSeverity, IssueStatus } from "@prisma/client";

const VALID_STATUSES: IssueStatus[] = ["OPEN", "RESOLVED", "IGNORED"];
const VALID_SEVERITIES: IssueSeverity[] = ["CRITICAL", "WARNING", "INFO"];

export const GET = withApiAuth<[{ params: Promise<{ repositoryId: string }> }]>(
  async (request, { organizationId }, { params }) => {
    const { repositoryId } = await params;
    await requireOrgRepository(organizationId, repositoryId);

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status")?.toUpperCase();
    const severityParam = url.searchParams.get("severity")?.toUpperCase();

    const status = statusParam && VALID_STATUSES.includes(statusParam as IssueStatus)
      ? (statusParam as IssueStatus)
      : "OPEN";
    const severity = severityParam && VALID_SEVERITIES.includes(severityParam as IssueSeverity)
      ? (severityParam as IssueSeverity)
      : undefined;

    const issues = await prisma.issue.findMany({
      where: { repositoryId, status, ...(severity ? { severity } : {}) },
      orderBy: { createdAt: "desc" },
      include: { environment: { select: { name: true } }, environmentVariable: { select: { key: true } } },
      take: 200,
    });

    return Response.json({
      data: issues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        status: issue.status,
        title: issue.title,
        description: issue.description,
        filePath: issue.filePath,
        lineNumber: issue.lineNumber,
        variableKey: issue.environmentVariable?.key ?? null,
        environmentName: issue.environment?.name ?? null,
        createdAt: issue.createdAt,
      })),
    });
  }
);
