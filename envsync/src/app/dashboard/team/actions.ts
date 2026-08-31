"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/auth-guard";
import { MEMBER_LIMITS } from "@/lib/plan";
import type { Role } from "@prisma/client";

export async function inviteMemberAction(email: string) {
  const { membership } = await requireMembership();
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only owners and admins can invite members.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Enter an email address.");

  const memberCount = await prisma.membership.count({ where: { organizationId: membership.organizationId } });
  const limit = MEMBER_LIMITS[membership.organization.plan];
  if (memberCount >= limit) {
    throw new Error(
      `Your ${membership.organization.plan} plan allows ${limit === Infinity ? "unlimited" : limit} member(s). Upgrade to Team for more seats.`
    );
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new Error("No EnvSync account found for that email yet — ask them to sign up first, then invite again.");
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: membership.organizationId } },
  });
  if (existing) throw new Error("That person is already a member.");

  await prisma.membership.create({
    data: { userId: user.id, organizationId: membership.organizationId, role: "MEMBER" },
  });

  revalidatePath("/dashboard/team");
}

export async function removeMemberAction(membershipId: string) {
  const { membership, userId } = await requireMembership();
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only owners and admins can remove members.");
  }

  const target = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!target || target.organizationId !== membership.organizationId) {
    throw new Error("Member not found.");
  }
  if (target.role === "OWNER") throw new Error("Can't remove the organization owner.");
  if (target.userId === userId) throw new Error("You can't remove yourself. Ask another owner or admin.");

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath("/dashboard/team");
}

export async function changeMemberRoleAction(membershipId: string, role: Role) {
  const { membership } = await requireMembership();
  if (membership.role !== "OWNER") {
    throw new Error("Only the owner can change roles.");
  }

  const target = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!target || target.organizationId !== membership.organizationId) {
    throw new Error("Member not found.");
  }
  if (target.role === "OWNER") throw new Error("Can't change the owner's role.");
  if (role === "OWNER") throw new Error("Ownership transfer isn't supported yet.");

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath("/dashboard/team");
}
