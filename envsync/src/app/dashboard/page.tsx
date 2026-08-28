import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scanError?: string }>;
}) {
  const { scanError } = await searchParams;
  const session = await auth();
  const membership = await getPrimaryMembership(session!.user.id);
  const repositories = membership?.organization.repositories ?? [];

  if (repositories.length > 0) {
    const target = `/dashboard/${repositories[0].id}`;
    redirect(scanError ? `${target}?scanError=1` : target);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderGit2 className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Connect your repository</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        EnvSync scans your codebase for environment variables and checks them across local,
        staging, and production — without ever reading or storing your secret values.
      </p>
      <Link href="/dashboard/connect">
        <Button size="lg">Connect GitHub repository</Button>
      </Link>
    </div>
  );
}
