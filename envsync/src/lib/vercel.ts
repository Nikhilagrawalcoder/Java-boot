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
export async function fetchVercelProjectEnv(token: string, projectId: string): Promise<VercelEnvVarPresence[]> {
  const data = (await vercelRequest(token, `/v10/projects/${encodeURIComponent(projectId)}/env`)) as {
    envs?: Array<{ key: string; target: string[] }>;
  };

  return (data.envs ?? []).map((env) => ({ key: env.key, targets: env.target }));
}

/** Verifies a token can actually read this project's env vars before saving the connection. */
export async function verifyVercelAccess(token: string, projectId: string): Promise<void> {
  await fetchVercelProjectEnv(token, projectId);
}
