import Link from "next/link";
import { Logo } from "@/components/logo";
import { GitHubIcon } from "@/components/icons";
import { GITHUB_REPO_URL } from "@/lib/constants";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "CLI", href: "/#cli" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "GitHub permissions", href: "/docs/github-permissions" },
      { label: "Source code", href: GITHUB_REPO_URL },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Sign in", href: "/signin" },
      { label: "Get started", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Configuration intelligence for SaaS teams. Not a secrets manager — a validation
              layer that catches broken config before it ships.
            </p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <GitHubIcon className="h-4 w-4" />
              Source on GitHub
            </a>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} EnvSync. All rights reserved.</p>
          <p>Never stores your secret values.</p>
        </div>
      </div>
    </footer>
  );
}
