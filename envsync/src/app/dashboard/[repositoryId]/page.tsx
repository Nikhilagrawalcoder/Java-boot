import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getRepositoryDashboardData } from "@/lib/scan/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthGauge } from "@/components/health-gauge";
import { EnvironmentCard } from "@/components/environment-card";
import { FindingItem } from "@/components/finding-item";
import { ToastFromParam } from "@/components/toast-from-param";

function severityOf(issue: { severity: string }): "critical" | "warning" | "healthy" {
  return issue.severity === "CRITICAL" ? "critical" : "warning";
}

export default async function RepositoryOverviewPage({
  params,
}: {
  params: Promise<{ repositoryId: string }>;
}) {
  const { repositoryId } = await params;
  const data = await getRepositoryDashboardData(repositoryId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <ToastFromParam
        param="scanError"
        messages={{ default: "The initial scan failed — try Rescan, or check the server logs." }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Configuration Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <HealthGauge score={data.score} />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center gap-1 rounded-md bg-destructive/10 py-2.5 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {data.critical} critical
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md bg-warning/10 py-2.5 text-warning">
              <AlertTriangle className="h-4 w-4" />
              {data.warning} warnings
            </div>
            <div className="flex flex-col items-center gap-1 rounded-md bg-success/10 py-2.5 text-success">
              <CheckCircle2 className="h-4 w-4" />
              {data.healthy} healthy
            </div>
          </div>
          {data.breakdown.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">Score breakdown</summary>
              <ul className="mt-2 space-y-1">
                {data.breakdown.map((entry) => (
                  <li key={entry.label} className="flex justify-between">
                    <span>{entry.label}</span>
                    <span className={entry.delta >= 0 ? "text-success" : "text-destructive"}>
                      {entry.delta >= 0 ? "+" : ""}
                      {entry.delta}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.environments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No environments configured yet.{" "}
              <Link
                href={`/dashboard/${data.repository.id}/environments`}
                className="underline underline-offset-4"
              >
                Set up Local, Staging, and Production
              </Link>
              .
            </p>
          ) : (
            data.environments.map((env) => (
              <EnvironmentCard key={env.id} name={env.name} healthy={env.configured} total={env.total} />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.issues.length === 0 && (
            <p className="text-sm text-muted-foreground">No open issues. Nice work.</p>
          )}
          {data.issues.slice(0, 8).map((issue) => (
            <Link
              key={issue.id}
              href={`/dashboard/${data.repository.id}/issues/${issue.id}`}
              className="block rounded-md px-2 py-1 hover:bg-muted"
            >
              <FindingItem severity={severityOf(issue)}>{issue.title}</FindingItem>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
