export type IssueSeverity = "CRITICAL" | "WARNING" | "INFO";
export type IssueStatus = "OPEN" | "RESOLVED" | "IGNORED";
export type IssueType =
  | "MISSING_VARIABLE"
  | "MISSING_FROM_EXAMPLE"
  | "UNDOCUMENTED_IN_EXAMPLE"
  | "SECRET_EXPOSURE"
  | "UNUSED_VARIABLE"
  | "ENV_INCONSISTENCY";
export type EnvironmentKind = "LOCAL" | "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  /** null until the first scan completes. */
  healthScore: number | null;
  lastScanAt: string | null;
  createdAt: string;
}

export interface RepositoryEnvironment {
  id: string;
  name: string;
  kind: EnvironmentKind;
  /** Detected variables marked configured in this environment. */
  configured: number;
  /** Total variables currently detected in the repository's code. */
  total: number;
}

export interface RepositoryDetail {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  healthScore: number | null;
  scoreBreakdown: Array<{ label: string; delta: number }>;
  issueCounts: { critical: number; warning: number; healthy: number };
  environments: RepositoryEnvironment[];
  lastScanAt: string | null;
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  title: string;
  description: string;
  filePath: string | null;
  lineNumber: number | null;
  variableKey: string | null;
  environmentName: string | null;
  createdAt: string;
}

export interface RescanResult {
  status: "completed";
  scanId: string;
  healthScore: number;
}

export interface ListIssuesFilters {
  status?: IssueStatus;
  severity?: IssueSeverity;
}

export interface EnvSyncClientOptions {
  /** An API key created from Settings → API keys. Required. */
  apiKey: string;
  /** Override for self-hosted deployments. Defaults to https://envsync.dev. */
  baseUrl?: string;
  /** Custom fetch implementation, for runtimes without a global `fetch`. */
  fetch?: typeof fetch;
}

/** Thrown for any non-2xx response from the EnvSync API. */
export class EnvSyncApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "EnvSyncApiError";
    this.status = status;
  }
}

const DEFAULT_BASE_URL = "https://envsync.dev";

/**
 * Client for the EnvSync REST API (`/api/v1`). Every call is authenticated
 * with the API key you pass to the constructor — the same kind of key
 * created from the EnvSync dashboard's Settings → API keys panel.
 *
 * ```ts
 * const client = new EnvSyncClient({ apiKey: process.env.ENVSYNC_API_KEY! });
 * const repos = await client.listRepositories();
 * ```
 */
export class EnvSyncClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: EnvSyncClientOptions) {
    if (!options.apiKey) {
      throw new Error("EnvSyncClient requires an `apiKey`. Create one from Settings -> API keys.");
    }

    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) {
      throw new Error(
        "No global `fetch` found. Pass one explicitly via `fetch` in EnvSyncClientOptions on older runtimes."
      );
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = fetchImpl;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${this.apiKey}`, ...(init?.headers ?? {}) },
    });

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: unknown }).error)
          : `Request to ${path} failed with status ${response.status}.`;
      throw new EnvSyncApiError(response.status, message);
    }

    return (body as { data: T }).data;
  }

  /** Lists every repository connected to your organization. */
  listRepositories(): Promise<Repository[]> {
    return this.request<Repository[]>("/api/v1/repositories");
  }

  /** Fetches a repository's current health score, breakdown, and environment coverage. */
  getRepository(repositoryId: string): Promise<RepositoryDetail> {
    return this.request<RepositoryDetail>(`/api/v1/repositories/${encodeURIComponent(repositoryId)}`);
  }

  /** Lists issues for a repository. Defaults to open issues of any severity. */
  listIssues(repositoryId: string, filters?: ListIssuesFilters): Promise<Issue[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.severity) params.set("severity", filters.severity);
    const query = params.toString();

    return this.request<Issue[]>(
      `/api/v1/repositories/${encodeURIComponent(repositoryId)}/issues${query ? `?${query}` : ""}`
    );
  }

  /** Triggers a fresh scan of the repository and waits for it to complete. */
  rescan(repositoryId: string): Promise<RescanResult> {
    return this.request<RescanResult>(`/api/v1/repositories/${encodeURIComponent(repositoryId)}/rescan`, {
      method: "POST",
    });
  }
}
