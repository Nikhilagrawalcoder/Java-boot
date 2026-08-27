import type { RepositoryDashboardData } from "./scan/dashboard-data";

// Deterministic, rule-based answers over EnvSync's own stored data — no LLM
// call, and nothing here can say anything that isn't backed by an actual
// scan/issue/environment record. Intent matching is plain keyword rules.

function formatIssueList(issues: RepositoryDashboardData["issues"]): string {
  return issues.map((issue) => `- ${issue.title}`).join("\n");
}

export function answerCopilotQuestion(question: string, data: RepositoryDashboardData): string {
  const q = question.toLowerCase();

  const mentionedEnvironment = data.environments.find((env) => q.includes(env.name.toLowerCase()));
  if (mentionedEnvironment && /(fail|broken|red|wrong|missing|why)/.test(q)) {
    const missing = data.issues.filter(
      (issue) => issue.type === "MISSING_VARIABLE" && issue.environmentId === mentionedEnvironment.id
    );

    if (missing.length === 0) {
      return `${mentionedEnvironment.name} looks healthy — ${mentionedEnvironment.configured}/${mentionedEnvironment.total} required variables are marked as configured there.`;
    }

    const details = missing
      .map((issue) => {
        const key = issue.environmentVariable?.key ?? "a variable";
        const usage = issue.environmentVariable?.usages[0];
        return `"${key}"${usage ? ` (referenced in ${usage.filePath})` : ""}`;
      })
      .join(", ");

    const otherEnvsWithIt = data.environments.filter((e) => e.id !== mentionedEnvironment.id);
    const otherNote =
      otherEnvsWithIt.length > 0
        ? ` ${otherEnvsWithIt.map((e) => e.name).join(" and ")} ${otherEnvsWithIt.length === 1 ? "has" : "have"} more variables configured — compare on the Environments tab.`
        : "";

    return `Your ${mentionedEnvironment.name} environment is missing ${missing.length} variable${missing.length === 1 ? "" : "s"}: ${details}.${otherNote}`;
  }

  if (/(what.*(chang|new)|latest scan|last scan)/.test(q)) {
    if (!data.lastScan) {
      return "No scans have run yet — click Rescan to run the first one.";
    }
    return `The latest scan ran ${data.lastScan.startedAt.toLocaleString()} and found ${
      data.repository.environmentVariables.length
    } total variable(s) in the codebase. There are currently ${data.critical} critical and ${data.warning} warning issue(s) open.`;
  }

  if (/(secret|expos|leak|credential)/.test(q)) {
    const secretIssues = data.issues.filter((issue) => issue.type === "SECRET_EXPOSURE");
    if (secretIssues.length === 0) return "No secret exposure findings right now.";
    return `Found ${secretIssues.length} possible secret exposure(s):\n${formatIssueList(secretIssues)}`;
  }

  if (/(unused|old|legacy|stale)/.test(q)) {
    const unused = data.issues.filter((issue) => issue.type === "UNUSED_VARIABLE");
    if (unused.length === 0) return "No variables currently look unused.";
    return `Possibly unused variables:\n${formatIssueList(unused)}`;
  }

  if (/(example|document)/.test(q)) {
    const undocumented = data.issues.filter(
      (issue) => issue.type === "MISSING_FROM_EXAMPLE" || issue.type === "UNDOCUMENTED_IN_EXAMPLE"
    );
    if (undocumented.length === 0) return ".env.example is fully in sync with the codebase.";
    return `.env.example issues:\n${formatIssueList(undocumented)}`;
  }

  const topIssue = data.issues[0];
  return `Configuration health is ${data.score}/100 (${data.critical} critical, ${data.warning} warning, ${data.healthy} healthy). ${
    topIssue ? `Top issue: ${topIssue.title}.` : "No open issues right now."
  }`;
}
