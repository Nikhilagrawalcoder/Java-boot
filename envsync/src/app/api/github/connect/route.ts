import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";

// Requests repo access only here — when the user actively chooses to
// connect a repository — not at sign-in. The caller picks how much access
// to grant: `public` requests GitHub's `public_repo` scope (public
// repositories only), anything else requests the broader `repo` scope
// (GitHub OAuth Apps don't offer a narrower read-only scope for private
// repositories; docs/github-permissions.md explains this tradeoff and the
// GitHub App upgrade path).
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (!process.env.GITHUB_ID) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=not_configured", request.url));
  }

  const requestedAccess = new URL(request.url).searchParams.get("access");
  const scope = requestedAccess === "public" ? "public_repo" : "repo";

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/github/callback", request.url).toString();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.GITHUB_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("envsync_github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
