import { prisma } from "@/lib/prisma";

/** The organization a user belongs to. MVP assumes one org per user (the one created at sign-up). */
export async function getPrimaryMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    include: {
      organization: {
        include: {
          repositories: true,
          githubInstallations: true,
          memberships: { include: { user: true }, orderBy: { createdAt: "asc" } },
          apiKeys: { orderBy: { createdAt: "desc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
