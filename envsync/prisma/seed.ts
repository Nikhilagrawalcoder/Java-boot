// Seeds the "Acme SaaS" demo scenario from the product spec, so a fresh
// deployment has a realistic, fully-populated dashboard to explore without
// needing a real GitHub OAuth App configured yet.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { syncEnvironmentIssues } from "../src/lib/scan/environment-sync";
import { computeHealthScore, type ScorableIssue } from "../src/lib/scan/scoring";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@envsync.dev";
const DEMO_PASSWORD = "envsync-demo";
const DEMO_SLUG = "acme-saas-demo";

const VARIABLES: Array<{
  key: string;
  category: string;
  isPublic?: boolean;
  usage?: { filePath: string; lineNumber: number };
}> = [
  { key: "DATABASE_URL", category: "database", usage: { filePath: "src/lib/db.ts", lineNumber: 3 } },
  { key: "STRIPE_SECRET_KEY", category: "stripe", usage: { filePath: "src/lib/stripe.ts", lineNumber: 5 } },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    category: "stripe",
    usage: { filePath: "src/app/api/webhooks/stripe/route.ts", lineNumber: 9 },
  },
  { key: "REDIS_URL", category: "redis", usage: { filePath: "src/lib/redis.ts", lineNumber: 4 } },
  { key: "S3_BUCKET", category: "storage", usage: { filePath: "src/lib/storage.ts", lineNumber: 7 } },
  {
    key: "NEXT_PUBLIC_API_URL",
    category: "url",
    isPublic: true,
    usage: { filePath: "src/app/layout.tsx", lineNumber: 12 },
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    category: "url",
    isPublic: true,
    usage: { filePath: "src/app/layout.tsx", lineNumber: 13 },
  },
  { key: "OLD_STRIPE_KEY", category: "stripe" }, // no usage — this is the "unused" one
];

async function main() {
  // Idempotent: wipe any previous demo data, then rebuild it fresh.
  await prisma.organization.deleteMany({ where: { slug: DEMO_SLUG } });
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: { name: "Demo User", email: DEMO_EMAIL, passwordHash },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Acme SaaS",
      slug: DEMO_SLUG,
      plan: "PRO",
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  const repository = await prisma.repository.create({
    data: {
      githubRepoId: "demo-acme-saas",
      name: "acme-saas",
      fullName: "acme/acme-saas",
      defaultBranch: "main",
      isPrivate: true,
      organizationId: org.id,
      lastScanAt: new Date(),
    },
  });

  const environments = await Promise.all(
    (
      [
        { name: "Local", kind: "LOCAL" as const, sourceFile: ".env.local" },
        { name: "Staging", kind: "STAGING" as const, sourceFile: ".env.staging" },
        { name: "Production", kind: "PRODUCTION" as const, sourceFile: null },
      ]
    ).map((env) => prisma.environment.create({ data: { ...env, repositoryId: repository.id } }))
  );
  const [local, staging, production] = environments;

  const variableRecords = await Promise.all(
    VARIABLES.map(async (v) => {
      const record = await prisma.environmentVariable.create({
        data: {
          repositoryId: repository.id,
          key: v.key,
          isPublic: v.isPublic ?? false,
          detectedType: v.category,
          inExampleFile: v.key !== "OLD_STRIPE_KEY",
        },
      });
      if (v.usage) {
        await prisma.variableUsage.create({
          data: { environmentVariableId: record.id, filePath: v.usage.filePath, lineNumber: v.usage.lineNumber },
        });
      }
      return record;
    })
  );

  const staleVariable = variableRecords.find((v) => v.key === "OLD_STRIPE_KEY")!;
  const staleAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  await prisma.environmentVariable.update({ where: { id: staleVariable.id }, data: { lastSeenAt: staleAgo } });

  const activeVariables = variableRecords.filter((v) => v.key !== "OLD_STRIPE_KEY");
  const missingInStaging = new Set(["REDIS_URL", "STRIPE_WEBHOOK_SECRET"]);

  for (const env of [local, staging, production]) {
    for (const variable of activeVariables) {
      const isConfigured = env.id === staging.id ? !missingInStaging.has(variable.key) : true;
      await prisma.environmentVariableState.create({
        data: { environmentId: env.id, environmentVariableId: variable.id, isConfigured },
      });
    }
  }

  // Recomputes MISSING_VARIABLE issues from the states above using the real product logic.
  await syncEnvironmentIssues(repository.id);

  const secretIssue = await prisma.issue.create({
    data: {
      repositoryId: repository.id,
      type: "SECRET_EXPOSURE",
      severity: "CRITICAL",
      title: "Possible Stripe secret key exposed in config/payment.js",
      description:
        "Move this value into an environment variable and rotate the exposed credential in the Stripe dashboard.",
      filePath: "config/payment.js",
      lineNumber: 14,
      metadata: { maskedPreview: "sk_live_••••••••••••9X2A", secretType: "Stripe secret key" },
    },
  });

  const unusedIssue = await prisma.issue.create({
    data: {
      repositoryId: repository.id,
      type: "UNUSED_VARIABLE",
      severity: "WARNING",
      title: '"OLD_STRIPE_KEY" appears unused',
      description: `OLD_STRIPE_KEY was detected in a previous scan (last seen ${staleAgo.toISOString()}), but no usage was found this time.`,
      environmentVariableId: staleVariable.id,
      metadata: { lastSeenAt: staleAgo.toISOString() },
    },
  });

  const openIssues = await prisma.issue.findMany({
    where: { repositoryId: repository.id, status: "OPEN" },
    include: { environment: true },
  });
  const scorable: ScorableIssue[] = openIssues.map((i) => ({
    type: i.type,
    severity: i.severity,
    environmentKind: i.environment?.kind,
  }));
  const { score, critical, warning, healthy } = computeHealthScore(
    scorable,
    activeVariables.length * environments.length
  );

  // A few historical scans (declining then recovering) so the score-history
  // chart has something real to show on a fresh demo, not just one point.
  const dayMs = 1000 * 60 * 60 * 24;
  const history = [
    { daysAgo: 6, healthScore: 91 },
    { daysAgo: 4, healthScore: 78 },
    { daysAgo: 2, healthScore: 58 },
  ];
  for (const entry of history) {
    const startedAt = new Date(Date.now() - entry.daysAgo * dayMs);
    await prisma.scan.create({
      data: {
        repositoryId: repository.id,
        status: "COMPLETED",
        healthScore: entry.healthScore,
        summary: { critical: 0, warning: 0, healthy: 0 },
        startedAt,
        completedAt: new Date(startedAt.getTime() + 1000 * 30),
      },
    });
  }

  await prisma.scan.create({
    data: {
      repositoryId: repository.id,
      status: "COMPLETED",
      healthScore: score,
      summary: { critical, warning, healthy },
      startedAt: new Date(Date.now() - 1000 * 60 * 4),
      completedAt: new Date(),
    },
  });

  console.log("Seeded demo scenario: Acme SaaS");
  console.log(`  Sign in at /signin with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Health score: ${score}/100 (created issues: secret=${secretIssue.id}, unused=${unusedIssue.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
