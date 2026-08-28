"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import { syncEnvironmentIssues } from "@/lib/scan/environment-sync";
import type { EnvironmentKind } from "@prisma/client";

async function refresh(repositoryId: string) {
  await syncEnvironmentIssues(repositoryId);
  revalidatePath(`/dashboard/${repositoryId}/environments`);
  revalidatePath(`/dashboard/${repositoryId}`);
}

export async function createEnvironmentAction(repositoryId: string, formData: FormData) {
  await requireRepositoryAccess(repositoryId);

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "LOCAL") as EnvironmentKind;
  const sourceFile = String(formData.get("sourceFile") ?? "").trim() || null;
  if (!name) return;

  await prisma.environment.create({ data: { repositoryId, name, kind, sourceFile } });
  await refresh(repositoryId);
}

export async function deleteEnvironmentAction(repositoryId: string, environmentId: string) {
  await requireRepositoryAccess(repositoryId);
  await prisma.environment.delete({ where: { id: environmentId } });
  await refresh(repositoryId);
}

export async function setVariableStateAction(
  repositoryId: string,
  environmentId: string,
  environmentVariableId: string,
  nextValue: boolean
) {
  await requireRepositoryAccess(repositoryId);

  await prisma.environmentVariableState.upsert({
    where: { environmentId_environmentVariableId: { environmentId, environmentVariableId } },
    create: { environmentId, environmentVariableId, isConfigured: nextValue },
    update: { isConfigured: nextValue },
  });

  await refresh(repositoryId);
}
