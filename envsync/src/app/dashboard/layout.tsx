import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { PLAN_LABELS } from "@/lib/plan";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { signOutAction } from "./sign-out-action";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const membership = await getPrimaryMembership(session.user.id);
  const repositories = membership?.organization.repositories ?? [];
  const planLabel = membership ? PLAN_LABELS[membership.organization.plan] : "Free";

  return (
    <DashboardShell
      repositories={repositories.map((r) => ({ id: r.id, name: r.name }))}
      userEmail={session.user.email ?? session.user.name ?? "Account"}
      planLabel={planLabel}
      signOutAction={signOutAction}
    >
      {children}
    </DashboardShell>
  );
}
