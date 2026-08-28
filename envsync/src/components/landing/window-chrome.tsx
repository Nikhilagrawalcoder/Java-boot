import { cn } from "@/lib/utils";

const DOTS = ["#ff5f57", "#febc2e", "#28c840"];

export function WindowChrome({
  title,
  url,
  children,
  className,
}: {
  title?: string;
  url?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/50",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          {DOTS.map((color) => (
            <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        {url ? (
          <div className="flex-1 truncate rounded-md bg-background/60 px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
            {url}
          </div>
        ) : title ? (
          <span className="font-mono text-xs text-muted-foreground">{title}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
