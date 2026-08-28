"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import { encryptSecret } from "@/lib/crypto";
import { verifyVercelAccess, VercelApiError } from "@/lib/vercel";
import { syncFromVercel } from "@/lib/scan/vercel-sync";

function refresh(repositoryId: string) {
  revalidatePath(`/dashboard/${repositoryId}/environments`);
  revalidatePath(`/dashboard/${repositoryId}`);
}

export async function connectVercelAction(repositoryId: string, formData: FormData) {
  await requireRepositoryAccess(repositoryId);

  const token = String(formData.get("token") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!token || !projectId) {
    throw new Error("Both a Vercel API token and a project ID are required.");
  }

  try {
    await verifyVercelAccess(token, projectId);
  } catch (error) {
    throw new Error(error instanceof VercelApiError ? error.message : "Couldn't verify that token and project.");
  }

  await prisma.vercelConnection.upsert({
    where: { repositoryId },
    create: { repositoryId, vercelProjectId: projectId, accessTokenEncrypted: encryptSecret(token) },
    update: { vercelProjectId: projectId, accessTokenEncrypted: encryptSecret(token) },
  });

  const result = await syncFromVercel(repositoryId);
  refresh(repositoryId);
  if (result.error) throw new Error(`Connected, but the first sync failed: ${result.error}`);
}

export async function disconnectVercelAction(repositoryId: string) {
  await requireRepositoryAccess(repositoryId);
  await prisma.vercelConnection.deleteMany({ where: { repositoryId } });
  refresh(repositoryId);
}

export async function syncVercelNowAction(repositoryId: string) {
  await requireRepositoryAccess(repositoryId);
  const result = await syncFromVercel(repositoryId);
  refresh(repositoryId);
  if (!result.synced) throw new Error(result.error ?? "No Vercel connection to sync from.");
}
