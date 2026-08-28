import Link from "next/link";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { IssueStatusAction } from "@/components/dashboard/issue-status-action";
import { ISSUE_TYPE_LABELS } from "@/lib/scan/issue-labels";
import { cn } from "@/lib/utils";
import type { IssueSeverity, IssueStatus } from "@prisma/client";

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "open", label: "Open" },
  { value: "ignored", label: "Ignored" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

const SEVERITY_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
];

export default async function IssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ repositoryId: string }>;
  searchParams: Promise<{ status?: string; severity?: string }>;
}) {
  const { repositoryId } = await params;
  const { status = "open", severity = "all" } = await searchParams;

  const [counts, issues] = await Promise.all([
    prisma.issue.groupBy({ by: ["status"], where: { repositoryId }, _count: true }),
    prisma.issue.findMany({
      where: {
        repositoryId,
        ...(status !== "all" ? { status: status.toUpperCase() as IssueStatus } : {}),
        ...(severity !== "all" ? { severity: severity.toUpperCase() as IssueSeverity } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { environment: true },
    }),
  ]);

  const countFor = (value: string) =>
    value === "all"
      ? counts.reduce((sum, c) => sum + c._count, 0)
      : counts.find((c) => c.status === value.toUpperCase())?._count ?? 0;

  function buildHref(next: { status?: string; severity?: string }) {
    const params = new URLSearchParams({
      status: next.status ?? status,
      severity: next.severity ?? severity,
    });
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                status === tab.value
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label} ({countFor(tab.value)})
            </Link>
          ))}
        </div>

        <div className="flex gap-1 text-sm">
          {SEVERITY_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={buildHref({ severity: filter.value })}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                severity === filter.value
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {issues.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No {status !== "all" ? status : ""} issues here.
            </p>
          )}
          {issues.map((issue) => (
            <div key={issue.id} className="flex items-center gap-3 px-4 py-3">
              {issue.severity === "CRITICAL" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              )}
              <Link href={`/dashboard/${repositoryId}/issues/${issue.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm hover:underline">{issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {ISSUE_TYPE_LABELS[issue.type]}
                  {issue.environment ? ` · ${issue.environment.name}` : ""}
                </p>
              </Link>
              <IssueStatusAction repositoryId={repositoryId} issueId={issue.id} status={issue.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
