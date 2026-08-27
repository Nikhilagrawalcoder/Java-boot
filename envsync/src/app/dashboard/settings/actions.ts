"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrimaryMembership } from "@/lib/org";

async function requireMembership() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) throw new Error("No organization for this user");
  return membership;
}

export async function disconnectGitHubAction() {
  const membership = await requireMembership();
  await prisma.gitHubInstallation.deleteMany({ where: { organizationId: membership.organizationId } });
  revalidatePath("/dashboard/settings");
}

export async function deleteRepositoryAction(repositoryId: string) {
  const membership = await requireMembership();
  const owns = membership.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");

  // Cascades to scans, issues, environments, and environment variables —
  // this is the "delete repository scan data" control from the security requirements.
  await prisma.repository.delete({ where: { id: repositoryId } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
