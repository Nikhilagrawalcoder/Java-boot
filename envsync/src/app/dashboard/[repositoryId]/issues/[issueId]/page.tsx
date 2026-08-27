import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/scan/classify";
import type { VariableCategory } from "@/lib/scan/types";
import { getFixInstructions } from "@/lib/scan/fix-instructions";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ repositoryId: string; issueId: string }>;
}) {
  const { repositoryId, issueId } = await params;
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      environment: true,
      environmentVariable: {
        include: {
          usages: { orderBy: { filePath: "asc" } },
          states: { include: { environment: true } },
        },
      },
    },
  });

  if (!issue || issue.repositoryId !== repositoryId) notFound();

  const variable = issue.environmentVariable;
  const fix = getFixInstructions({
    type: issue.type,
    description: issue.description,
    variableKey: variable?.key,
    environmentName: issue.environment?.name,
    environmentKind: issue.environment?.kind,
    filePath: issue.filePath,
    metadata: issue.metadata,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant={issue.severity === "CRITICAL" ? "critical" : "warning"}>
          {issue.severity === "CRITICAL" ? "Critical" : "Warning"}
        </Badge>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {variable ? variable.key : issue.title}
        </h1>
        {variable && <p className="text-sm text-muted-foreground">{issue.title}</p>}
      </div>

      <Card>
        <CardContent className="grid gap-4 py-5 sm:grid-cols-2">
          {issue.filePath && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="font-mono text-sm">
                {issue.filePath}
                {issue.lineNumber ? `:${issue.lineNumber}` : ""}
              </p>
            </div>
          )}

          {variable?.usages.length ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Used in</p>
              <ul className="space-y-0.5 font-mono text-sm">
                {variable.usages.map((u) => (
                  <li key={`${u.filePath}:${u.lineNumber}`}>
                    {u.filePath}:{u.lineNumber}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {variable && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Required by</p>
              <p className="text-sm">{CATEGORY_LABELS[variable.detectedType as VariableCategory] ?? "Application configuration"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {variable && variable.states.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Environments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {variable.states.map((state) => (
              <div key={state.id} className="flex items-center justify-between text-sm">
                <span>{state.environment.name}</span>
                <span className={state.isConfigured ? "text-success" : "text-destructive"}>
                  {state.isConfigured ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{fix.summary}</p>
          {fix.example && (
            <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">
              {fix.example}
            </pre>
          )}
          <p className="text-xs text-muted-foreground">
            EnvSync never displays or stores real secret values — examples above use placeholders only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
