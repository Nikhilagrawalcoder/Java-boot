"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import { runScan } from "@/lib/scan/pipeline";

export async function rescanAction(repositoryId: string) {
  const { userId } = await requireRepositoryAccess(repositoryId);
  await runScan(repositoryId, userId);
  revalidatePath(`/dashboard/${repositoryId}`);
}

export async function disconnectRepositoryAction(repositoryId: string) {
  await requireRepositoryAccess(repositoryId);
  // Cascades to scans, issues, environments, and environment variables.
  await prisma.repository.delete({ where: { id: repositoryId } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
