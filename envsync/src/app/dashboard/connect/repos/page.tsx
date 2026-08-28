import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { decryptSecret } from "@/lib/crypto";
import { fetchUserRepositories } from "@/lib/github";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/plan";
import { ToastFromParam } from "@/components/toast-from-param";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "That repository selection was missing required data. Please try again.",
  plan_limit: "You've reached your plan's repository limit.",
  default: "Something went wrong connecting that repository.",
};

export default async function SelectRepositoryPage() {
  const session = await auth();
  const membership = await getPrimaryMembership(session!.user.id);
  const installation = membership?.organization.githubInstallations[0];

  if (!membership || !installation) {
    redirect("/dashboard/connect");
  }

  const connectedRepoIds = new Set(membership.organization.repositories.map((r) => r.githubRepoId));
  const limit = PLAN_LIMITS[membership.organization.plan];
  const atLimit = membership.organization.repositories.length >= limit;

  let repos: Awaited<ReturnType<typeof fetchUserRepositories>> = [];
  let error: string | null = null;
  try {
    const token = decryptSecret(installation.accessTokenEncrypted);
    repos = await fetchUserRepositories(token);
  } catch {
    error = "Couldn't reach GitHub with the stored connection. Try reconnecting.";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <ToastFromParam param="error" messages={ERROR_MESSAGES} />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Choose a repository</h1>
        <p className="text-sm text-muted-foreground">
          Connected as <span className="font-medium text-foreground">{installation.accountLogin}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {atLimit && (
        <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
          Your {membership.organization.plan} plan allows {limit} repositor{limit === 1 ? "y" : "ies"}.
          Upgrade on the <Link href="/dashboard/settings" className="underline">settings page</Link> to
          connect another.
        </p>
      )}

      <div className="space-y-2">
        {repos.map((repo) => {
          const alreadyConnected = connectedRepoIds.has(repo.githubRepoId);
          return (
            <Card key={repo.githubRepoId}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">{repo.fullName}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="muted">{repo.isPrivate ? "private" : "public"}</Badge>
                    <Badge variant="muted">{repo.defaultBranch}</Badge>
                  </div>
                </div>
                {alreadyConnected ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <form action="/api/repositories/connect" method="post">
                    <input type="hidden" name="githubRepoId" value={repo.githubRepoId} />
                    <input type="hidden" name="name" value={repo.name} />
                    <input type="hidden" name="fullName" value={repo.fullName} />
                    <input type="hidden" name="defaultBranch" value={repo.defaultBranch} />
                    <input type="hidden" name="isPrivate" value={String(repo.isPrivate)} />
                    <SubmitButton size="sm" disabled={atLimit} pendingText="Scanning...">
                      Scan this repository
                    </SubmitButton>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
        {repos.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">No repositories found for this account.</p>
        )}
      </div>
    </div>
  );
}
