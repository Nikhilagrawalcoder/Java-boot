const VERCEL_API_BASE = "https://api.vercel.com";

export class VercelApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "VercelApiError";
  }
}

/** One environment variable's *name* and where it's deployed — never its value. */
export interface VercelEnvVarPresence {
  key: string;
  /** Vercel's own targets: "production" | "preview" | "development". */
  targets: string[];
}

export interface VercelProjectSummary {
  id: string;
  name: string;
}

function withTeam(path: string, teamId?: string | null): string {
  if (!teamId) return path;
  return `${path}${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(teamId)}`;
}

async function vercelRequest(token: string, path: string): Promise<unknown> {
  const response = await fetch(`${VERCEL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new VercelApiError(response.status, "That token was rejected by Vercel — check it hasn't expired or been revoked.");
    }
    if (response.status === 404) {
      throw new VercelApiError(404, "No Vercel project found with that ID. Copy it from Project Settings → General.");
    }
    throw new VercelApiError(response.status, `Vercel API request failed (${response.status}).`);
  }

  return response.json();
}

/**
 * Lists every environment variable configured on a Vercel project, by name
 * and target only. We deliberately never read the `value` field the Vercel
 * API can return for non-sensitive variables — EnvSync's whole premise is
 * never touching secret values, so we discard it even when Vercel offers it.
 */
export async function fetchVercelProjectEnv(
  token: string,
  projectId: string,
  teamId?: string | null
): Promise<VercelEnvVarPresence[]> {
  const data = (await vercelRequest(
    token,
    withTeam(`/v10/projects/${encodeURIComponent(projectId)}/env`, teamId)
  )) as { envs?: Array<{ key: string; target: string[] }> };

  return (data.envs ?? []).map((env) => ({ key: env.key, targets: env.target }));
}

/** Verifies a token can actually read this project's env vars before saving the connection. */
export async function verifyVercelAccess(token: string, projectId: string, teamId?: string | null): Promise<void> {
  await fetchVercelProjectEnv(token, projectId, teamId);
}

/** Lists projects visible to this token, optionally scoped to a team. */
export async function listVercelProjects(token: string, teamId?: string | null): Promise<VercelProjectSummary[]> {
  const data = (await vercelRequest(token, withTeam("/v9/projects", teamId))) as {
    projects?: Array<{ id: string; name: string }>;
  };
  return (data.projects ?? []).map((p) => ({ id: p.id, name: p.name }));
}

export interface VercelOAuthToken {
  accessToken: string;
  teamId: string | null;
}

/**
 * Exchanges an OAuth2 authorization code for an access token, per Vercel's
 * OAuth2 Application flow (console.vercel.com/integrations -> OAuth2
 * Application; authorize at https://vercel.com/oauth/authorize). Verify
 * against Vercel's current docs if this ever starts failing — third-party
 * OAuth endpoints can't be exercised end-to-end without a live registered
 * app and a real user consent step.
 */
export async function exchangeVercelOAuthCode(code: string, redirectUri: string): Promise<VercelOAuthToken> {
  const clientId = process.env.VERCEL_CLIENT_ID;
  const clientSecret = process.env.VERCEL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new VercelApiError(500, "Vercel OAuth is not configured on this server.");
  }

  const response = await fetch(`${VERCEL_API_BASE}/v2/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await response.json()) as { access_token?: string; team_id?: string; error?: string };
  if (!response.ok || !data.access_token) {
    throw new VercelApiError(response.status, data.error ?? "Vercel rejected the authorization code.");
  }

  return { accessToken: data.access_token, teamId: data.team_id ?? null };
}
