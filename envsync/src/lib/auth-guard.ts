import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";

/** Throws unless the current session's user belongs to the org that owns this repository. */
export async function requireRepositoryAccess(repositoryId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const membership = await getPrimaryMembership(session.user.id);
  const owns = membership?.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");

  return { userId: session.user.id, membership };
}

/** Throws unless the current session's user has a membership at all, returning it. */
export async function requireMembership() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) throw new Error("No organization for this user");

  return { userId: session.user.id, membership };
}
