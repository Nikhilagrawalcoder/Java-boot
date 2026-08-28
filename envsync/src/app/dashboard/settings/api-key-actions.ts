"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/auth-guard";
import { generateApiKey } from "@/lib/api-keys";
import { API_KEY_LIMITS } from "@/lib/plan";

function assertCanManageKeys(role: string) {
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("Only owners and admins can manage API keys.");
  }
}

export async function createApiKeyAction(name: string) {
  const { userId, membership } = await requireMembership();
  assertCanManageKeys(membership.role);

  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Give the key a name so you can identify it later.");

  const activeCount = await prisma.apiKey.count({
    where: { organizationId: membership.organizationId, revokedAt: null },
  });
  const limit = API_KEY_LIMITS[membership.organization.plan];
  if (activeCount >= limit) {
    throw new Error(
      `Your ${membership.organization.plan} plan allows ${limit === Infinity ? "unlimited" : limit} active API key(s). Revoke one or upgrade to create another.`
    );
  }

  const { plaintext, keyPrefix, keyHash } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      name: trimmedName,
      keyPrefix,
      keyHash,
      organizationId: membership.organizationId,
      createdById: userId,
    },
  });

  revalidatePath("/dashboard/settings");

  // The only place the plaintext key ever exists outside the client's clipboard.
  return { plaintext };
}

export async function revokeApiKeyAction(apiKeyId: string) {
  const { membership } = await requireMembership();
  assertCanManageKeys(membership.role);

  const target = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
  if (!target || target.organizationId !== membership.organizationId) {
    throw new Error("API key not found.");
  }
  if (target.revokedAt) return;

  await prisma.apiKey.update({ where: { id: apiKeyId }, data: { revokedAt: new Date() } });
  revalidatePath("/dashboard/settings");
}
