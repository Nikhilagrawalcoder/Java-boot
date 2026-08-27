"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrimaryMembership } from "@/lib/org";
import { runScan } from "@/lib/scan/pipeline";

async function assertAccess(repositoryId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const membership = await getPrimaryMembership(session.user.id);
  const owns = membership?.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");

  return session.user.id;
}

export async function rescanAction(repositoryId: string) {
  const userId = await assertAccess(repositoryId);
  await runScan(repositoryId, userId);
  revalidatePath(`/dashboard/${repositoryId}`);
}

export async function disconnectRepositoryAction(repositoryId: string) {
  await assertAccess(repositoryId);
  // Cascades to scans, issues, environments, and environment variables.
  await prisma.repository.delete({ where: { id: repositoryId } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
