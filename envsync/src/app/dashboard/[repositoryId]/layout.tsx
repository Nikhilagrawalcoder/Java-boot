import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { rescanAction } from "./actions";

function timeAgo(date: Date | null): string {
  if (!date) return "never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function RepositoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ repositoryId: string }>;
}) {
  const { repositoryId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const membership = await getPrimaryMembership(session.user.id);
  const repository = membership?.organization.repositories.find((r) => r.id === repositoryId);
  if (!repository) notFound();

  const tabs = [
    { href: `/dashboard/${repository.id}`, label: "Overview" },
    { href: `/dashboard/${repository.id}/environments`, label: "Environments" },
    { href: `/dashboard/${repository.id}/actions`, label: "CI setup" },
    { href: `/dashboard/${repository.id}/copilot`, label: "Copilot" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Repository</p>
          <h1 className="text-lg font-semibold">{repository.fullName}</h1>
          <p className="text-xs text-muted-foreground">Last scan: {timeAgo(repository.lastScanAt)}</p>
        </div>
        <form action={rescanAction.bind(null, repository.id)}>
          <Button type="submit" variant="outline">
            Rescan
          </Button>
        </form>
      </div>

      <nav className="flex gap-1 border-b border-border text-sm">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
