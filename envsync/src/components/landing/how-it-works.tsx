import { ScanSearch, ShieldCheck } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

const STEPS = [
  {
    icon: GitHubIcon,
    title: "Connect a repository",
    description:
      "Sign in with GitHub and authorize read-only access to one repository. No write access, ever.",
  },
  {
    icon: ScanSearch,
    title: "EnvSync scans it",
    description:
      "Every environment-variable reference is detected and classified in seconds — never the values, only what exists and where.",
  },
  {
    icon: ShieldCheck,
    title: "Fix before you deploy",
    description:
      "See exactly what's missing, exposed, or undocumented, with fix instructions — then wire envsync check into CI so it never regresses.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          From connect to confident deploy
        </h2>
        <p className="mt-3 text-muted-foreground">Three steps. No production secrets required.</p>
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="relative text-center sm:text-left">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card sm:mx-0">
              <step.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">Step {index + 1}</p>
            <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
