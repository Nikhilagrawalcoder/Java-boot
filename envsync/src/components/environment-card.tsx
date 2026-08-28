import { CheckCircle2, AlertTriangle } from "lucide-react";
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
      <span
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold tabular-nums",
          isHealthy ? "text-success" : "text-warning"
        )}
      >
        {healthy}/{total}
        {isHealthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      </span>
    </div>
  );
}
