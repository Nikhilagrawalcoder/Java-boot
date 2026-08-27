import { NextResponse } from "next/server";
import { verifyGitHubSignature, decryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { fetchRepositoryTree, fetchFileContent, postPullRequestComment } from "@/lib/github";
import { scanSourceFiles } from "@/lib/scan/scanner";
import { shouldScanPath } from "@/lib/scan/patterns";
import { parseEnvExample, diffAgainstExample } from "@/lib/scan/example-diff";
import type { SourceFile } from "@/lib/scan/types";

interface PullRequestPayload {
  action: string;
  pull_request: { number: number; head: { sha: string } };
  repository: { id: number; full_name: string };
}

// Feature 9 (PR checks): flags a variable that's new in this PR's code and
// still undocumented in .env.example. Requires a real deployment with a
// public URL for GitHub to reach this endpoint — see docs/github-permissions.md.
export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!secret || !verifyGitHubSignature(rawBody, request.headers.get("x-hub-signature-256"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (request.headers.get("x-github-event") !== "pull_request") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payload = JSON.parse(rawBody) as PullRequestPayload;
  if (!["opened", "synchronize", "reopened"].includes(payload.action)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const repository = await prisma.repository.findUnique({
    where: { githubRepoId: String(payload.repository.id) },
    include: {
      organization: { include: { githubInstallations: true } },
      environmentVariables: true,
    },
  });
  if (!repository) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const installation = repository.organization.githubInstallations[0];
  if (!installation) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const token = decryptSecret(installation.accessTokenEncrypted);
  const headSha = payload.pull_request.head.sha;
  const fullName = payload.repository.full_name;

  const tree = await fetchRepositoryTree(token, fullName, headSha);
  const candidatePaths = tree
    .filter((entry) => shouldScanPath(entry.path) || entry.path === ".env.example")
    .slice(0, 400);

  const files: SourceFile[] = (
    await Promise.all(
      candidatePaths.map(async (entry) => {
        const content = await fetchFileContent(token, fullName, entry.path, headSha).catch(() => null);
        return content !== null ? { path: entry.path, content } : null;
      })
    )
  ).filter((f): f is SourceFile => f !== null);

  const detected = scanSourceFiles(files);
  const exampleFile = files.find((f) => f.path === ".env.example");
  const exampleEntries = exampleFile ? parseEnvExample(exampleFile.content) : [];
  const diff = diffAgainstExample(detected, exampleEntries);

  const knownKeys = new Set(repository.environmentVariables.map((v) => v.key));
  const newUndocumented = diff.missingFromExample.filter((v) => !knownKeys.has(v.key));

  if (newUndocumented.length === 0) {
    return NextResponse.json({ ok: true, newIssues: 0 });
  }

  const lines = newUndocumented.map((variable) => {
    const usage = variable.usages[0];
    return `⚠️ **"${variable.key}"** is used in code${
      usage ? ` (\`${usage.filePath}\`)` : ""
    } but isn't documented in \`.env.example\`.`;
  });

  const body = `**EnvSync found ${newUndocumented.length} configuration issue${
    newUndocumented.length === 1 ? "" : "s"
  }**\n\n${lines.join("\n")}`;

  await postPullRequestComment(token, fullName, payload.pull_request.number, body);

  return NextResponse.json({ ok: true, newIssues: newUndocumented.length });
}
