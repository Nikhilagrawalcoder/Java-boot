import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { fetchRepositoryTree, fetchFileContent } from "@/lib/github";
import { scanSourceFiles } from "./scanner";
import { shouldScanPath } from "./patterns";
import { detectSecrets, shouldScanForSecrets } from "./secrets";
import { parseEnvExample, diffAgainstExample } from "./example-diff";
import { computeHealthScore, type ScorableIssue } from "./scoring";
import { syncEnvironmentIssues } from "./environment-sync";
import type { SourceFile } from "./types";

const MAX_FILES_TO_FETCH = 400;
const MAX_FILE_SIZE_BYTES = 200_000;
const FETCH_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function runScan(repositoryId: string, triggeredById?: string) {
  const repository = await prisma.repository.findUniqueOrThrow({
    where: { id: repositoryId },
    include: { organization: { include: { githubInstallations: true } } },
  });

  const installation = repository.organization.githubInstallations[0];
  if (!installation) {
    throw new Error("No GitHub connection for this repository's organization.");
  }

  const scan = await prisma.scan.create({
    data: { repositoryId, status: "RUNNING", triggeredById },
  });

  try {
    const accessToken = decryptSecret(installation.accessTokenEncrypted);

    const tree = await fetchRepositoryTree(accessToken, repository.fullName, repository.defaultBranch);

    const candidatePaths = tree
      .filter(
        (entry) =>
          (entry.size ?? 0) <= MAX_FILE_SIZE_BYTES &&
          (shouldScanPath(entry.path) || entry.path === ".env.example" || shouldScanForSecrets(entry.path))
      )
      .slice(0, MAX_FILES_TO_FETCH);

    const files: SourceFile[] = (
      await mapWithConcurrency(candidatePaths, FETCH_CONCURRENCY, async (entry) => {
        const content = await fetchFileContent(accessToken, repository.fullName, entry.path).catch(
          () => null
        );
        return content !== null ? { path: entry.path, content } : null;
      })
    ).filter((f): f is SourceFile => f !== null);

    const detected = scanSourceFiles(files);

    const exampleFile = files.find((f) => f.path === ".env.example");
    const exampleEntries = exampleFile ? parseEnvExample(exampleFile.content) : [];
    const exampleDiff = diffAgainstExample(detected, exampleEntries);
    const exampleKeys = new Set(exampleEntries.map((e) => e.key));

    const secretFindings = detectSecrets(files);

    const existingVariables = await prisma.environmentVariable.findMany({
      where: { repositoryId },
    });
    const detectedKeys = new Set(detected.map((d) => d.key));
    const nowUnused = existingVariables.filter((v) => !detectedKeys.has(v.key));

    // Upsert every currently-detected variable and refresh its usage locations.
    const upsertedVariables = await Promise.all(
      detected.map(async (variable) => {
        const record = await prisma.environmentVariable.upsert({
          where: { repositoryId_key: { repositoryId, key: variable.key } },
          create: {
            repositoryId,
            key: variable.key,
            isPublic: variable.isPublic,
            detectedType: variable.category,
            inExampleFile: exampleKeys.has(variable.key),
          },
          update: {
            isPublic: variable.isPublic,
            detectedType: variable.category,
            inExampleFile: exampleKeys.has(variable.key),
          },
        });

        await prisma.variableUsage.deleteMany({ where: { environmentVariableId: record.id } });
        await prisma.variableUsage.createMany({
          data: variable.usages.map((u) => ({
            environmentVariableId: record.id,
            filePath: u.filePath,
            lineNumber: u.lineNumber,
          })),
        });

        return record;
      })
    );

    const variableIdByKey = new Map(upsertedVariables.map((v) => [v.key, v.id]));

    const issuesToCreate: Array<{
      type: "MISSING_FROM_EXAMPLE" | "UNDOCUMENTED_IN_EXAMPLE" | "UNUSED_VARIABLE" | "SECRET_EXPOSURE";
      severity: "CRITICAL" | "WARNING";
      title: string;
      description: string;
      filePath?: string;
      lineNumber?: number;
      environmentVariableId?: string;
      metadata?: object;
    }> = [];

    for (const variable of exampleDiff.missingFromExample) {
      issuesToCreate.push({
        type: "MISSING_FROM_EXAMPLE",
        severity: "CRITICAL",
        title: `"${variable.key}" is used but missing from .env.example`,
        description: `The application references ${variable.key}, but it isn't declared in .env.example, so new contributors won't know it's required.`,
        filePath: variable.usages[0]?.filePath,
        lineNumber: variable.usages[0]?.lineNumber,
        environmentVariableId: variableIdByKey.get(variable.key),
      });
    }

    for (const entry of exampleDiff.undocumentedInExample) {
      issuesToCreate.push({
        type: "UNDOCUMENTED_IN_EXAMPLE",
        severity: "WARNING",
        title: `"${entry.key}" exists in .env.example but wasn't detected in code`,
        description: `.env.example declares ${entry.key}, but the current scan found no usage of it in the codebase.`,
        filePath: ".env.example",
        lineNumber: entry.lineNumber,
      });
    }

    for (const variable of nowUnused) {
      issuesToCreate.push({
        type: "UNUSED_VARIABLE",
        severity: "WARNING",
        title: `"${variable.key}" appears unused`,
        description: `${variable.key} was detected in a previous scan (last seen ${variable.lastSeenAt.toISOString()}), but no usage was found this time.`,
        environmentVariableId: variable.id,
        metadata: { lastSeenAt: variable.lastSeenAt.toISOString() },
      });
    }

    for (const finding of secretFindings) {
      issuesToCreate.push({
        type: "SECRET_EXPOSURE",
        severity: finding.severity,
        title: `Possible ${finding.secretType} exposed in ${finding.filePath}`,
        description: finding.recommendedAction,
        filePath: finding.filePath,
        lineNumber: finding.lineNumber,
        metadata: { maskedPreview: finding.maskedPreview, secretType: finding.secretType },
      });
    }

    // Superseded issues from prior scans are resolved rather than deleted, preserving history.
    await prisma.issue.updateMany({
      where: { repositoryId, status: "OPEN" },
      data: { status: "RESOLVED" },
    });

    if (issuesToCreate.length > 0) {
      await prisma.issue.createMany({
        data: issuesToCreate.map((issue) => ({ ...issue, repositoryId, scanId: scan.id })),
      });
    }

    // This score covers code-derived issues only (example diff, secrets, unused
    // vars) — it's the audit-trail score for this scan. Environment-coverage
    // issues (Feature 5) depend on manually-configured Environment state that
    // can change anytime, so the dashboard recomputes the live combined score
    // at render time rather than trusting this value as the final number.
    const scorableIssues: ScorableIssue[] = issuesToCreate.map((issue) => ({
      type: issue.type,
      severity: issue.severity,
    }));
    const totalChecks = detected.length || 1;
    const { score, critical, warning } = computeHealthScore(scorableIssues, totalChecks);

    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        healthScore: score,
        summary: { critical, warning, healthy: Math.max(0, totalChecks - critical - warning) },
      },
    });

    await prisma.repository.update({ where: { id: repositoryId }, data: { lastScanAt: new Date() } });

    // Refresh environment-coverage issues now that the variable set may have changed.
    await syncEnvironmentIssues(repositoryId);

    return { scanId: scan.id, healthScore: score };
  } catch (error) {
    await prisma.scan.update({
      where: { id: scan.id },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw error;
  }
}
