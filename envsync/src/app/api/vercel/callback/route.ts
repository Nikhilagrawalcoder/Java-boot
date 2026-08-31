import { NextResponse } from "next/server";
import { requireRepositoryAccess } from "@/lib/auth-guard";
import { encryptSecret } from "@/lib/crypto";
import { exchangeVercelOAuthCode } from "@/lib/vercel";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers.get("cookie")?.match(/envsync_vercel_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/dashboard?vercelError=invalid_state", request.url));
  }

  const repositoryId = state.split(":")[0];

  try {
    await requireRepositoryAccess(repositoryId);
  } catch {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  let token;
  try {
    token = await exchangeVercelOAuthCode(code, new URL("/api/vercel/callback", request.url).toString());
  } catch {
    return NextResponse.redirect(
      new URL(`/dashboard/${repositoryId}/environments?vercelError=token_exchange`, request.url)
    );
  }

  // Nothing is persisted to the database yet — the user still needs to pick
  // which project to connect. The token lives only in a short-lived,
  // encrypted, httpOnly cookie until they confirm a project on the
  // Environments page (finalizeVercelConnectionAction).
  const pending = Buffer.from(
    JSON.stringify({
      repositoryId,
      token: encryptSecret(token.accessToken),
      teamId: token.teamId,
    })
  ).toString("base64url");

  const response = NextResponse.redirect(
    new URL(`/dashboard/${repositoryId}/environments?vercel=pick-project`, request.url)
  );
  response.cookies.delete("envsync_vercel_oauth_state");
  response.cookies.set("envsync_vercel_pending", pending, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
