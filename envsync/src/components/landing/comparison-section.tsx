import { Check, Minus } from "lucide-react";

interface Row {
  capability: string;
  github: boolean | "partial";
  envsync: boolean;
}

const ROWS: Row[] = [
  { capability: "Detects committed secrets in git history", github: true, envsync: true },
  { capability: "Blocks a push containing a live key", github: true, envsync: false },
  { capability: "Knows which env vars your code actually reads", github: false, envsync: true },
  { capability: "Sees what's really configured in Production vs Staging", github: false, envsync: true },
  { capability: "Flags a variable missing from .env.example", github: false, envsync: true },
  { capability: "Live sync from your Vercel project — not just git", github: false, envsync: true },
  { capability: "A single health score to track config drift over time", github: false, envsync: true },
];

function Cell({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Not a replacement</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            GitHub secret scanning and EnvSync solve different problems
          </h2>
          <p className="mt-3 text-muted-foreground">
            Keep GitHub&apos;s secret scanning on — it&apos;s free and it&apos;s good at what it does. It just
            can&apos;t see anything outside your git repository, which is where most config problems actually
            live.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="p-4 font-medium">Capability</th>
                <th className="p-4 text-center font-medium">GitHub secret scanning</th>
                <th className="p-4 text-center font-medium text-foreground">EnvSync</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.capability} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">{row.capability}</td>
                  <td className="p-4 text-center">
                    <Cell value={row.github} />
                  </td>
                  <td className="p-4 text-center">
                    <Cell value={row.envsync} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          The short version: GitHub tells you a secret leaked into git. EnvSync tells you your next deploy
          is about to crash because Staging is missing a variable — before it does.
        </p>
      </div>
    </section>
  );
}
