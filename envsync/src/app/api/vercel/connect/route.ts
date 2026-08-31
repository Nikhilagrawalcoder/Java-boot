import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireRepositoryAccess } from "@/lib/auth-guard";

// One-click connect: the state param embeds the repositoryId (not secret —
// integrity comes from the httpOnly cookie match on callback, same pattern
// as /api/github/connect) so the callback knows which repository to attach
// the resulting connection to.
export async function GET(request: Request) {
  const repositoryId = new URL(request.url).searchParams.get("repositoryId");
  if (!repositoryId) {
    return NextResponse.json({ error: "Missing repositoryId" }, { status: 400 });
  }

  try {
    await requireRepositoryAccess(repositoryId);
  } catch {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (!process.env.VERCEL_CLIENT_ID) {
    return NextResponse.redirect(
      new URL(`/dashboard/${repositoryId}/environments?vercelError=not_configured`, request.url)
    );
  }

  const state = `${repositoryId}:${randomBytes(16).toString("hex")}`;
  const redirectUri = new URL("/api/vercel/callback", request.url).toString();

  const authorizeUrl = new URL("https://vercel.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.VERCEL_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("envsync_vercel_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
