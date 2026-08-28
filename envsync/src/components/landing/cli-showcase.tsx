import { WindowChrome } from "./window-chrome";

export function CliShowcase() {
  return (
    <section id="cli" className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-medium text-primary">Built for CI</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            One command. Runs entirely offline.
          </h2>
          <p className="text-muted-foreground">
            The <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">envsync</code>{" "}
            CLI uses the exact same detection engine as the dashboard, against your local
            filesystem — no account, no network call, no uploaded code.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">envsync check</code>{" "}
            exits non-zero the moment something critical is wrong, so a broken deploy never gets
            past your pipeline.
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm">
            <code>npm install -g envsync</code>
          </pre>
        </div>

        <WindowChrome title="~/acme-saas — zsh">
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
            <span className="text-muted-foreground">$ </span>npx envsync check{"\n\n"}
            EnvSync{"\n\n"}
            Scanning project...{"\n\n"}
            <span className="text-success">✓</span> 24 variables detected{"\n"}
            <span className="text-success">✓</span> 21 variables documented{"\n"}
            <span className="text-warning">⚠</span> 2 unused variables{"\n"}
            <span className="text-destructive">🔴</span> 1 possible secret exposure{"\n\n"}
            Configuration Health: <span className="text-warning">74/100</span>
            {"\n\n"}
            <span className="text-destructive">
              ✗ 1 critical configuration issue found.
            </span>
          </pre>
        </WindowChrome>
      </div>
    </section>
  );
}
