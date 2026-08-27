import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "healthy";

const dot: Record<Severity, string> = {
  critical: "🔴",
  warning: "🟡",
  healthy: "🟢",
};

export function FindingItem({
  severity,
  children,
  className,
}: {
  severity: Severity;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2 text-sm", className)}>
      <span aria-hidden>{dot[severity]}</span>
      <span>{children}</span>
    </div>
  );
}
