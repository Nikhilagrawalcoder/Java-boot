import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-keys";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface ApiAuthContext {
  organizationId: string;
  apiKeyId: string;
}

/** Verifies the `Authorization: Bearer <key>` header and returns the owning organization. */
export async function authenticateApiRequest(request: Request): Promise<ApiAuthContext> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  if (!token) {
    throw new ApiError(401, "Missing bearer token. Pass your API key as `Authorization: Bearer <key>`.");
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash: hashApiKey(token) } });
  if (!apiKey || apiKey.revokedAt) {
    throw new ApiError(401, "Invalid or revoked API key.");
  }

  // Best-effort — a slow write here should never fail the request it's tracking.
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { organizationId: apiKey.organizationId, apiKeyId: apiKey.id };
}

/** Loads a repository and confirms it belongs to the authenticated organization. */
export async function requireOrgRepository(organizationId: string, repositoryId: string) {
  const repository = await prisma.repository.findUnique({ where: { id: repositoryId } });
  if (!repository || repository.organizationId !== organizationId) {
    throw new ApiError(404, "Repository not found.");
  }
  return repository;
}

/**
 * Wraps a v1 API route handler with bearer-token auth and consistent error
 * responses. `Args` forwards whatever extra argument Next.js passes to the
 * route handler (e.g. `{ params }` for a dynamic segment).
 */
export function withApiAuth<Args extends unknown[] = []>(
  handler: (request: Request, ctx: ApiAuthContext, ...args: Args) => Promise<Response>
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request: Request, ...args: Args) => {
    try {
      const ctx = await authenticateApiRequest(request);
      return await handler(request, ctx, ...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("[api/v1] unhandled error:", error);
      return Response.json({ error: "Internal server error." }, { status: 500 });
    }
  };
}
