import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrimaryMembership } from "@/lib/org";
import { PLAN_LIMITS } from "@/lib/plan";
import { runScan } from "@/lib/scan/pipeline";
import { decryptSecret } from "@/lib/crypto";
import { registerRepositoryWebhook } from "@/lib/github";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const limit = PLAN_LIMITS[membership.organization.plan];
  if (membership.organization.repositories.length >= limit) {
    return NextResponse.redirect(new URL("/dashboard/connect/repos?error=plan_limit", request.url));
  }

  const formData = await request.formData();
  const githubRepoId = String(formData.get("githubRepoId") ?? "");
  const name = String(formData.get("name") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const defaultBranch = String(formData.get("defaultBranch") ?? "main");
  const isPrivate = formData.get("isPrivate") === "true";

  if (!githubRepoId || !name || !fullName) {
    return NextResponse.redirect(new URL("/dashboard/connect/repos?error=invalid", request.url));
  }

  const repository = await prisma.repository.upsert({
    where: { githubRepoId },
    create: {
      githubRepoId,
      name,
      fullName,
      defaultBranch,
      isPrivate,
      organizationId: membership.organizationId,
    },
    update: { name, fullName, defaultBranch, isPrivate },
  });

  try {
    await runScan(repository.id, session.user.id);
  } catch (error) {
    console.error("Initial scan failed", error);
    return NextResponse.redirect(new URL(`/dashboard?scanError=1`, request.url));
  }

  // PR checks (Feature 9) are opt-in and non-fatal: a repo scans fine without them.
  const installation = membership.organization.githubInstallations[0];
  if (installation && process.env.GITHUB_WEBHOOK_SECRET) {
    try {
      const token = decryptSecret(installation.accessTokenEncrypted);
      const webhookUrl = new URL("/api/webhooks/github", request.url).toString();
      await registerRepositoryWebhook(token, fullName, webhookUrl, process.env.GITHUB_WEBHOOK_SECRET);
    } catch (error) {
      console.warn("Could not register PR-check webhook (non-fatal):", error);
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
