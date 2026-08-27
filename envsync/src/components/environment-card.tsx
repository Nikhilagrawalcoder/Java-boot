import { cn } from "@/lib/utils";

export function EnvironmentCard({
  name,
  healthy,
  total,
}: {
  name: string;
  healthy: number;
  total: number;
}) {
  const isHealthy = healthy === total;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {name}
      </span>
      <span className={cn("text-sm font-semibold tabular-nums", isHealthy ? "text-success" : "text-warning")}>
        {healthy}/{total} {isHealthy ? "✓" : "⚠️"}
      </span>
    </div>
  );
}
