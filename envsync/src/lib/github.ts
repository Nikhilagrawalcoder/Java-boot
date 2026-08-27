const GITHUB_API = "https://api.github.com";

export interface GitHubRepoSummary {
  githubRepoId: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
}

export interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

function authHeaders(accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function githubFetch(path: string, accessToken: string) {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: authHeaders(accessToken) });
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}) for ${path}`);
  }
  return res;
}

export async function fetchGitHubUser(
  accessToken: string
): Promise<{ id: number; login: string; type: string }> {
  const res = await githubFetch("/user", accessToken);
  return res.json();
}

export async function fetchUserRepositories(accessToken: string): Promise<GitHubRepoSummary[]> {
  const res = await githubFetch(
    "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator",
    accessToken
  );
  const data = (await res.json()) as Array<{
    id: number;
    name: string;
    full_name: string;
    default_branch: string;
    private: boolean;
  }>;

  return data.map((r) => ({
    githubRepoId: String(r.id),
    name: r.name,
    fullName: r.full_name,
    defaultBranch: r.default_branch,
    isPrivate: r.private,
  }));
}

/** Lists every file path in the repository (recursive git tree), blobs only. */
export async function fetchRepositoryTree(
  accessToken: string,
  fullName: string,
  branch: string
): Promise<GitHubTreeEntry[]> {
  const res = await githubFetch(
    `/repos/${fullName}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    accessToken
  );
  const data = (await res.json()) as {
    tree: Array<{ path: string; type: string; size?: number }>;
    truncated?: boolean;
  };

  return data.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => ({ path: entry.path, type: "blob" as const, size: entry.size }));
}

/** Fetches and decodes a single file's text content. Returns null for binary/undecodable content. */
export async function fetchFileContent(
  accessToken: string,
  fullName: string,
  path: string,
  ref?: string
): Promise<string | null> {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const res = await githubFetch(
    `/repos/${fullName}/contents/${path.split("/").map(encodeURIComponent).join("/")}${query}`,
    accessToken
  );
  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") return null;

  try {
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch {
    return null;
  }
}

/** Registers this deployment's webhook endpoint on the repo, for PR checks. Non-fatal if it fails. */
export async function registerRepositoryWebhook(
  accessToken: string,
  fullName: string,
  webhookUrl: string,
  secret: string
): Promise<void> {
  const res = await fetch(`${GITHUB_API}/repos/${fullName}/hooks`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["pull_request"],
      config: { url: webhookUrl, content_type: "json", secret },
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}) registering webhook`);
  }
}

export async function postPullRequestComment(
  accessToken: string,
  fullName: string,
  pullNumber: number,
  body: string
): Promise<void> {
  const res = await fetch(`${GITHUB_API}/repos/${fullName}/issues/${pullNumber}/comments`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}) posting PR comment`);
  }
}
