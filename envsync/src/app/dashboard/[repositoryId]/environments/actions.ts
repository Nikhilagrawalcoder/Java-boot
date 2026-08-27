"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrimaryMembership } from "@/lib/org";
import { syncEnvironmentIssues } from "@/lib/scan/environment-sync";
import type { EnvironmentKind } from "@prisma/client";

async function assertAccess(repositoryId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  const membership = await getPrimaryMembership(session.user.id);
  const owns = membership?.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");
}

async function refresh(repositoryId: string) {
  await syncEnvironmentIssues(repositoryId);
  revalidatePath(`/dashboard/${repositoryId}/environments`);
  revalidatePath(`/dashboard/${repositoryId}`);
}

export async function createEnvironmentAction(repositoryId: string, formData: FormData) {
  await assertAccess(repositoryId);

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "LOCAL") as EnvironmentKind;
  const sourceFile = String(formData.get("sourceFile") ?? "").trim() || null;
  if (!name) return;

  await prisma.environment.create({ data: { repositoryId, name, kind, sourceFile } });
  await refresh(repositoryId);
}

export async function deleteEnvironmentAction(repositoryId: string, environmentId: string) {
  await assertAccess(repositoryId);
  await prisma.environment.delete({ where: { id: environmentId } });
  await refresh(repositoryId);
}

export async function setVariableStateAction(
  repositoryId: string,
  environmentId: string,
  environmentVariableId: string,
  nextValue: boolean
) {
  await assertAccess(repositoryId);

  await prisma.environmentVariableState.upsert({
    where: { environmentId_environmentVariableId: { environmentId, environmentVariableId } },
    create: { environmentId, environmentVariableId, isConfigured: nextValue },
    update: { isConfigured: nextValue },
  });

  await refresh(repositoryId);
}
