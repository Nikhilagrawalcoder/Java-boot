const STACK = [
  "Next.js",
  "Node.js",
  "Python / Django",
  "PostgreSQL",
  "Redis",
  "Stripe",
  "Supabase",
  "AWS S3",
];

export function StackRow() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Detects configuration for the stack you already use
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {STACK.map((name) => (
          <span
            key={name}
            className="rounded-full border border-border px-3.5 py-1.5 font-mono text-xs text-muted-foreground"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
