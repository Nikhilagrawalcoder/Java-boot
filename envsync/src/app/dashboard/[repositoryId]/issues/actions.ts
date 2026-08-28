"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import type { IssueStatus } from "@prisma/client";

export async function setIssueStatusAction(repositoryId: string, issueId: string, status: IssueStatus) {
  await requireRepositoryAccess(repositoryId);

  const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { repositoryId: true } });
  if (!issue || issue.repositoryId !== repositoryId) throw new Error("Issue not found");

  await prisma.issue.update({ where: { id: issueId }, data: { status } });
  revalidatePath(`/dashboard/${repositoryId}/issues`);
  revalidatePath(`/dashboard/${repositoryId}`);
}
