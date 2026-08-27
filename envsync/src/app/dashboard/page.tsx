import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  const membership = await prisma.membership.findFirst({
    where: { userId: session!.user.id },
    include: { organization: { include: { repositories: true } } },
    orderBy: { createdAt: "asc" },
  });

  const repositories = membership?.organization.repositories ?? [];

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
        <div className="text-4xl" aria-hidden>
          🔌
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

  // Populated once the repository scanner (Phase 3+) exists.
  return null;
}
