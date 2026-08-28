import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { PLAN_LIMITS, PLAN_LABELS, MEMBER_LIMITS } from "@/lib/plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DestructiveActionButton } from "@/components/dashboard/destructive-action-button";
import { MemberRow } from "@/components/dashboard/member-row";
import { InviteMemberForm } from "@/components/dashboard/invite-member-form";
import { disconnectGitHubAction, deleteRepositoryAction } from "./actions";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) redirect("/dashboard");

  const org = membership.organization;
  const installation = org.githubInstallations[0];
  const limit = PLAN_LIMITS[org.plan];
  const memberLimit = MEMBER_LIMITS[org.plan];
  const canRemoveMembers = membership.role === "OWNER" || membership.role === "ADMIN";
  const canChangeRoles = membership.role === "OWNER";
  const canInvite = canRemoveMembers && org.memberships.length < memberLimit;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">{org.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              {PLAN_LABELS[org.plan]} — {org.repositories.length}/
              {limit === Infinity ? "∞" : limit} repositories used
            </p>
          </div>
          <Link href="/#pricing" className="text-sm underline underline-offset-4">
            View plans
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {org.memberships.length}/{memberLimit === Infinity ? "∞" : memberLimit} seat
            {memberLimit === 1 ? "" : "s"} used
            {memberLimit !== Infinity && org.memberships.length >= memberLimit && (
              <>
                {" "}
                — upgrade to{" "}
                <Link href="/#pricing" className="underline underline-offset-4">
                  Team
                </Link>{" "}
                for unlimited members.
              </>
            )}
          </p>

          <div className="space-y-2">
            {org.memberships.map((m) => (
              <MemberRow
                key={m.id}
                membershipId={m.id}
                name={m.user.name ?? m.user.email ?? "Unknown"}
                email={m.user.email ?? ""}
                role={m.role}
                isSelf={m.userId === session.user.id}
                canRemove={canRemoveMembers}
                canChangeRole={canChangeRoles}
              />
            ))}
          </div>

          {canInvite && <InviteMemberForm />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            EnvSync reads repository contents only, to scan for environment-variable usage and
            <code className="mx-1 rounded bg-muted px-1 py-0.5">.env.example</code>. It never
            requests write access and never reads or stores your secret values. See{" "}
            <a
              href="https://github.com/Nikhilagrawalcoder/Java-boot/blob/main/envsync/docs/github-permissions.md"
              className="underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              the full breakdown
            </a>
            .
          </p>
          {installation ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  Connected as <span className="font-medium">{installation.accountLogin}</span>
                </p>
                <Badge variant="success">Active</Badge>
              </div>
              <DestructiveActionButton
                size="sm"
                action={disconnectGitHubAction}
                confirmMessage="Disconnect GitHub? You'll need to reauthorize to scan or connect repositories again."
                loadingMessage="Disconnecting..."
                successMessage="GitHub disconnected"
              >
                Disconnect GitHub
              </DestructiveActionButton>
            </div>
          ) : (
            <Link href="/dashboard/connect">
              <Button size="sm">Connect GitHub</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repositories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {org.repositories.length === 0 && (
            <p className="text-sm text-muted-foreground">No repositories connected yet.</p>
          )}
          {org.repositories.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <Link href={`/dashboard/${repo.id}`} className="text-sm font-medium underline-offset-4 hover:underline">
                  {repo.fullName}
                </Link>
              </div>
              <DestructiveActionButton
                size="sm"
                action={deleteRepositoryAction.bind(null, repo.id)}
                confirmMessage={`Disconnect ${repo.fullName} and permanently delete all its scan data? This can't be undone.`}
                loadingMessage="Deleting..."
                successMessage="Repository disconnected"
              >
                Disconnect &amp; delete scan data
              </DestructiveActionButton>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
