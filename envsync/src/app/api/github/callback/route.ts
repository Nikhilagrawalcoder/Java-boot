import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";
import { fetchGitHubUser } from "@/lib/github";
import { getPrimaryMembership } from "@/lib/org";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/envsync_github_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=invalid_state", request.url));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_ID,
      client_secret: process.env.GITHUB_SECRET,
      code,
      redirect_uri: new URL("/api/github/callback", request.url).toString(),
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    scope?: string;
    error?: string;
  };

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=token_exchange", request.url));
  }

  const githubUser = await fetchGitHubUser(tokenData.access_token);
  const membership = await getPrimaryMembership(session.user.id);
  if (!membership) {
    return NextResponse.redirect(new URL("/dashboard?error=no_organization", request.url));
  }

  await prisma.gitHubInstallation.upsert({
    where: { organizationId: membership.organizationId },
    create: {
      githubInstallationId: String(githubUser.id),
      accountLogin: githubUser.login,
      accountType: githubUser.type,
      accessTokenEncrypted: encryptSecret(tokenData.access_token),
      scope: tokenData.scope ?? "",
      organizationId: membership.organizationId,
      connectedById: session.user.id,
    },
    update: {
      githubInstallationId: String(githubUser.id),
      accountLogin: githubUser.login,
      accountType: githubUser.type,
      accessTokenEncrypted: encryptSecret(tokenData.access_token),
      scope: tokenData.scope ?? "",
      connectedById: session.user.id,
    },
  });

  const response = NextResponse.redirect(new URL("/dashboard/connect/repos", request.url));
  response.cookies.delete("envsync_github_oauth_state");
  return response;
}
