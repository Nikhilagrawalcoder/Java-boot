"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/auth-guard";

export async function disconnectGitHubAction() {
  const { membership } = await requireMembership();
  await prisma.gitHubInstallation.deleteMany({ where: { organizationId: membership.organizationId } });
  revalidatePath("/dashboard/settings");
}

export async function deleteRepositoryAction(repositoryId: string) {
  const { membership } = await requireMembership();
  const owns = membership.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");

  // Cascades to scans, issues, environments, and environment variables —
  // this is the "delete repository scan data" control from the security requirements.
  await prisma.repository.delete({ where: { id: repositoryId } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
