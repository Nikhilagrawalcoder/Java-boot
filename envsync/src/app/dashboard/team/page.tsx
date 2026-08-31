import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { MEMBER_LIMITS } from "@/lib/plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberRow } from "@/components/dashboard/member-row";
import { InviteMemberForm } from "@/components/dashboard/invite-member-form";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) redirect("/dashboard");

  const org = membership.organization;
  const memberLimit = MEMBER_LIMITS[org.plan];
  const canRemoveMembers = membership.role === "OWNER" || membership.role === "ADMIN";
  const canChangeRoles = membership.role === "OWNER";
  const canInvite = canRemoveMembers && org.memberships.length < memberLimit;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          {org.name} — {org.memberships.length}/{memberLimit === Infinity ? "∞" : memberLimit} seat
          {memberLimit === 1 ? "" : "s"} used
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {memberLimit !== Infinity && org.memberships.length >= memberLimit && (
            <p className="text-xs text-muted-foreground">
              You&apos;re at your plan&apos;s seat limit — upgrade to{" "}
              <Link href="/#pricing" className="underline underline-offset-4">
                Team
              </Link>{" "}
              for unlimited members.
            </p>
          )}

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
    </div>
  );
}
