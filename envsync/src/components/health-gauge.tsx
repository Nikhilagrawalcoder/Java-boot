import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

export function HealthGauge({ score, className }: { score: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-4xl font-semibold tabular-nums", scoreTone(pct))}>{pct}</span>
        <span className="text-lg text-muted-foreground">/ 100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
