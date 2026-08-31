"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { verifyVercelAccess, listVercelProjects, VercelApiError, type VercelProjectSummary } from "@/lib/vercel";
import { syncFromVercel } from "@/lib/scan/vercel-sync";

const PENDING_COOKIE = "envsync_vercel_pending";

function refresh(repositoryId: string) {
  revalidatePath(`/dashboard/${repositoryId}/environments`);
  revalidatePath(`/dashboard/${repositoryId}`);
}

interface PendingVercelConnection {
  repositoryId: string;
  token: string;
  teamId: string | null;
}

async function readPendingConnection(repositoryId: string): Promise<PendingVercelConnection | null> {
  const raw = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    const pending = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as PendingVercelConnection;
    return pending.repositoryId === repositoryId ? pending : null;
  } catch {
    return null;
  }
}

/** Whether an OAuth round-trip just completed and is waiting on a project pick, for this repository. */
export async function hasPendingVercelConnection(repositoryId: string): Promise<boolean> {
  return (await readPendingConnection(repositoryId)) !== null;
}

/** Lists the projects reachable by the just-obtained OAuth token, for the post-connect project picker. */
export async function listPendingVercelProjectsAction(repositoryId: string): Promise<VercelProjectSummary[]> {
  await requireRepositoryAccess(repositoryId);
  const pending = await readPendingConnection(repositoryId);
  if (!pending) throw new Error("Your Vercel connection expired — click Connect with Vercel again.");

  try {
    return await listVercelProjects(decryptSecret(pending.token), pending.teamId);
  } catch (error) {
    throw new Error(error instanceof VercelApiError ? error.message : "Couldn't list your Vercel projects.");
  }
}

/** Confirms the project the user picked after the OAuth round-trip and saves the connection. */
export async function finalizeVercelConnectionAction(repositoryId: string, projectId: string) {
  await requireRepositoryAccess(repositoryId);
  const pending = await readPendingConnection(repositoryId);
  if (!pending) throw new Error("Your Vercel connection expired — click Connect with Vercel again.");

  const token = decryptSecret(pending.token);
  try {
    await verifyVercelAccess(token, projectId, pending.teamId);
  } catch (error) {
    throw new Error(error instanceof VercelApiError ? error.message : "Couldn't verify access to that project.");
  }

  await prisma.vercelConnection.upsert({
    where: { repositoryId },
    create: { repositoryId, vercelProjectId: projectId, vercelTeamId: pending.teamId, accessTokenEncrypted: pending.token },
    update: { vercelProjectId: projectId, vercelTeamId: pending.teamId, accessTokenEncrypted: pending.token },
  });

  (await cookies()).delete(PENDING_COOKIE);
  const result = await syncFromVercel(repositoryId);
  refresh(repositoryId);
  if (result.error) throw new Error(`Connected, but the first sync failed: ${result.error}`);
}

/** Cancels an in-progress OAuth connect before a project is picked. */
export async function cancelPendingVercelConnectionAction(repositoryId: string) {
  (await cookies()).delete(PENDING_COOKIE);
  refresh(repositoryId);
}

/** Fallback for self-hosters without Vercel OAuth configured: connect with a pasted token instead. */
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
