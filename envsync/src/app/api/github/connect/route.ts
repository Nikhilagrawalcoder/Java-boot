import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";

// Requests the `repo` scope only here — when the user actively chooses to
// connect a repository — not at sign-in. GitHub OAuth Apps don't offer a
// narrower read-only scope for private repositories; docs/github-permissions.md
// explains this tradeoff and the GitHub App upgrade path.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (!process.env.GITHUB_ID) {
    return NextResponse.redirect(new URL("/dashboard/connect?error=not_configured", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/github/callback", request.url).toString();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.GITHUB_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo");
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
