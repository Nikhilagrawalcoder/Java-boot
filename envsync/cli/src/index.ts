import { resolve } from "path";
import { scanSourceFiles } from "../../src/lib/scan/scanner";
import { detectSecrets } from "../../src/lib/scan/secrets";
import { parseEnvExample, diffAgainstExample } from "../../src/lib/scan/example-diff";
import { computeHealthScore, type ScorableIssue } from "../../src/lib/scan/scoring";
import { readProjectFiles } from "./scan-directory";

function runAnalysis(targetDir: string) {
  const files = readProjectFiles(targetDir);
  const detected = scanSourceFiles(files);

  const exampleFile = files.find((f) => f.path === ".env.example");
  const exampleEntries = exampleFile ? parseEnvExample(exampleFile.content) : [];
  const diff = diffAgainstExample(detected, exampleEntries);

  const secretFindings = detectSecrets(files);

  const issues: ScorableIssue[] = [
    ...diff.missingFromExample.map(() => ({ type: "MISSING_FROM_EXAMPLE" as const, severity: "CRITICAL" as const })),
    ...diff.undocumentedInExample.map(() => ({ type: "UNDOCUMENTED_IN_EXAMPLE" as const, severity: "WARNING" as const })),
    ...secretFindings.map((f) => ({ type: "SECRET_EXPOSURE" as const, severity: f.severity })),
  ];

  const scoreResult = computeHealthScore(issues, detected.length || 1);

  return { detected, diff, secretFindings, scoreResult, hasExampleFile: Boolean(exampleFile) };
}

function printReport(result: ReturnType<typeof runAnalysis>) {
  const { detected, diff, secretFindings, scoreResult, hasExampleFile } = result;

  console.log("EnvSync\n");
  console.log("Scanning project...\n");
  console.log(`✓ ${detected.length} variable${detected.length === 1 ? "" : "s"} detected`);

  if (hasExampleFile) {
    const documented = detected.length - diff.missingFromExample.length;
    console.log(`✓ ${documented} variable${documented === 1 ? "" : "s"} documented in .env.example`);
  } else {
    console.log("⚠ No .env.example found — variable documentation can't be checked");
  }

  if (diff.undocumentedInExample.length > 0) {
    console.log(
      `⚠ ${diff.undocumentedInExample.length} variable${diff.undocumentedInExample.length === 1 ? "" : "s"} declared but unused`
    );
  }
  if (secretFindings.length > 0) {
    console.log(`🔴 ${secretFindings.length} possible secret exposure${secretFindings.length === 1 ? "" : "s"}`);
  }

  console.log(`\nConfiguration Health: ${scoreResult.score}/100\n`);

  if (diff.missingFromExample.length > 0) {
    console.log("Missing from .env.example:");
    for (const variable of diff.missingFromExample) {
      const usage = variable.usages[0];
      console.log(`  🔴 ${variable.key}${usage ? ` (${usage.filePath}:${usage.lineNumber})` : ""}`);
    }
    console.log("");
  }

  if (diff.undocumentedInExample.length > 0) {
    console.log("Declared in .env.example but not detected in code:");
    for (const entry of diff.undocumentedInExample) {
      console.log(`  🟡 ${entry.key}`);
    }
    console.log("");
  }

  if (secretFindings.length > 0) {
    console.log("Possible secret exposure:");
    for (const finding of secretFindings) {
      const icon = finding.severity === "CRITICAL" ? "🔴" : "🟡";
      console.log(`  ${icon} ${finding.filePath}:${finding.lineNumber} — ${finding.secretType} (${finding.maskedPreview})`);
    }
    console.log("");
  }
}

function main() {
  const [, , command, pathArg] = process.argv;
  const targetDir = resolve(process.cwd(), pathArg ?? ".");

  if (command !== "scan" && command !== "check") {
    console.log("Usage: envsync <scan|check> [path]");
    process.exit(command ? 1 : 0);
    return;
  }

  const result = runAnalysis(targetDir);
  printReport(result);

  if (command === "check") {
    if (result.scoreResult.critical > 0) {
      console.error(`✗ ${result.scoreResult.critical} critical configuration issue(s) found.`);
      process.exit(1);
    }
    console.log("✓ No critical configuration issues.");
  }
}

main();
