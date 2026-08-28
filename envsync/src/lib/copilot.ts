import type { RepositoryDashboardData } from "./scan/dashboard-data";
import { findProvider } from "./scan/classify";
import { getFixInstructions } from "./scan/fix-instructions";

// Deterministic, rule-based answers over EnvSync's own stored data — no LLM
// call, and nothing here can say anything that isn't backed by an actual
// scan/issue/environment record. Intent matching is plain keyword rules,
// ordered from most specific (a named variable or vendor) to most generic
// (the overall health summary), so a specific question never gets answered
// with a vague one.

type Environment = RepositoryDashboardData["environments"][number];
type Issue = RepositoryDashboardData["issues"][number];
type Variable = RepositoryDashboardData["repository"]["environmentVariables"][number];

function formatIssueList(issues: Issue[]): string {
  return issues.map((issue) => `- ${issue.title}`).join("\n");
}

function missingVariablesInEnvironment(data: RepositoryDashboardData, environmentId: string) {
  return data.issues.filter(
    (issue) => issue.type === "MISSING_VARIABLE" && issue.environmentId === environmentId
  );
}

function describeMissing(missing: Issue[]): string {
  return missing
    .map((issue) => {
      const key = issue.environmentVariable?.key ?? "a variable";
      const usage = issue.environmentVariable?.usages[0];
      return `"${key}"${usage ? ` (referenced in ${usage.filePath})` : ""}`;
    })
    .join(", ");
}

function findMentionedEnvironments(q: string, data: RepositoryDashboardData): Environment[] {
  return data.environments
    .filter((env) => q.includes(env.name.toLowerCase()))
    .sort((a, b) => q.indexOf(a.name.toLowerCase()) - q.indexOf(b.name.toLowerCase()));
}

/** Finds a detected variable the question names, by exact key or a loose case-insensitive match. */
function findMentionedVariable(q: string, data: RepositoryDashboardData): Variable | undefined {
  const upper = q.toUpperCase();
  const variables = data.repository.environmentVariables;

  const exact = variables.find((v) => upper.includes(v.key));
  if (exact) return exact;

  // Loose match: the question mentions the variable's name with different
  // casing/underscores, e.g. "stripe secret key" for STRIPE_SECRET_KEY.
  const normalized = upper.replace(/[^A-Z0-9]/g, "");
  return variables.find((v) => normalized.includes(v.key.replace(/_/g, "")));
}

function variableReport(variable: Variable, data: RepositoryDashboardData): string {
  const relatedIssues = data.issues.filter((issue) => issue.environmentVariableId === variable.id);
  const configuredIn = data.environments.filter(
    (env) => !missingVariablesInEnvironment(data, env.id).some((i) => i.environmentVariableId === variable.id)
  );
  const missingIn = data.environments.filter((env) => !configuredIn.includes(env));

  const lines = [
    `"${variable.key}" — ${variable.isPublic ? "public" : "server-only"}, ${
      variable.inExampleFile ? "documented in .env.example" : "missing from .env.example"
    }.`,
  ];

  if (variable.usages.length > 0) {
    lines.push(`Used in: ${variable.usages.map((u) => `${u.filePath}:${u.lineNumber}`).join(", ")}.`);
  }

  if (data.environments.length > 0) {
    lines.push(
      missingIn.length === 0
        ? `Configured in every environment (${configuredIn.map((e) => e.name).join(", ")}).`
        : `Missing in: ${missingIn.map((e) => e.name).join(", ")}.${
            configuredIn.length > 0 ? ` Configured in: ${configuredIn.map((e) => e.name).join(", ")}.` : ""
          }`
    );
  }

  if (relatedIssues.length > 0) {
    const fix = getFixInstructions({
      type: relatedIssues[0].type,
      description: relatedIssues[0].description,
      variableKey: variable.key,
      environmentName: missingIn[0]?.name,
      environmentKind: missingIn[0]?.kind,
      metadata: relatedIssues[0].metadata,
    });
    lines.push(`How to fix: ${fix.summary}${fix.example ? ` e.g. \`${fix.example}\`` : ""}`);
  }

  return lines.join("\n");
}

const HELP_TEXT = `I can answer questions using this repository's actual scan data — no guessing. Try things like:
- "Why is staging failing?" — what's missing in a specific environment
- "Any issues with Stripe?" — problems tied to a specific vendor (works for any of the 500+ providers EnvSync recognizes)
- "How do I fix STRIPE_WEBHOOK_SECRET?" — targeted fix instructions for one variable
- "Is the score improving?" — health score trend over recent scans
- "Any secrets exposed?" / "What's unused?" / "Is .env.example in sync?"
- "How many critical issues are there?"`;

export function answerCopilotQuestion(question: string, data: RepositoryDashboardData): string {
  const q = question.toLowerCase().trim();

  if (/^(hi|hello|hey|help|what can you|what do you do)/.test(q)) {
    return HELP_TEXT;
  }

  // Score trend — checked early since "score" alone shouldn't fall through
  // to the generic summary if the question is specifically about direction.
  if (/(trend|improving|getting (better|worse)|history|(going|is it) (up|down))/.test(q) && /(score|health)/.test(q)) {
    if (data.scoreHistory.length < 2) {
      return `Not enough scan history yet to show a trend — current score is ${data.score}/100.`;
    }
    const first = data.scoreHistory[0].score;
    const last = data.scoreHistory[data.scoreHistory.length - 1].score;
    const delta = last - first;
    const direction = delta > 0 ? "improved" : delta < 0 ? "declined" : "stayed flat";
    return `Configuration health has ${direction} by ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"} over the last ${data.scoreHistory.length} scans (${first} → ${last}). Current score: ${data.score}/100.`;
  }

  // A specific variable name, mentioned directly — most specific intent.
  const mentionedVariable = findMentionedVariable(q, data);
  if (mentionedVariable) {
    return variableReport(mentionedVariable, data);
  }

  // A vendor mentioned by name (Stripe, Twilio, Supabase, ...) rather than an
  // exact variable — group every detected variable and issue tied to it.
  const mentionedProvider = findProvider(question.toUpperCase());
  if (mentionedProvider) {
    const providerVariables = data.repository.environmentVariables.filter(
      (v) => findProvider(v.key)?.name === mentionedProvider.name
    );
    if (providerVariables.length === 0) {
      return `No ${mentionedProvider.name} variables were detected in this repository.`;
    }
    const variableIds = new Set(providerVariables.map((v) => v.id));
    const relatedIssues = data.issues.filter((issue) => issue.environmentVariableId && variableIds.has(issue.environmentVariableId));

    const header = `${mentionedProvider.name}: ${providerVariables.map((v) => v.key).join(", ")}.`;
    if (relatedIssues.length === 0) {
      return `${header} No open issues.`;
    }
    return `${header} ${relatedIssues.length} open issue${relatedIssues.length === 1 ? "" : "s"}:\n${formatIssueList(relatedIssues)}`;
  }

  // Two environments named at once — a comparison, not a single-environment question.
  const mentionedEnvironments = findMentionedEnvironments(q, data);
  if (mentionedEnvironments.length >= 2 && /(differ|compar|vs|versus|between)/.test(q)) {
    const [a, b] = mentionedEnvironments;
    const missingA = missingVariablesInEnvironment(data, a.id);
    const missingB = missingVariablesInEnvironment(data, b.id);
    return [
      `${a.name}: ${a.configured}/${a.total} configured${missingA.length ? ` — missing ${describeMissing(missingA)}` : ""}.`,
      `${b.name}: ${b.configured}/${b.total} configured${missingB.length ? ` — missing ${describeMissing(missingB)}` : ""}.`,
    ].join("\n");
  }

  if (mentionedEnvironments.length === 1 && /(fail|broken|red|wrong|missing|why)/.test(q)) {
    const environment = mentionedEnvironments[0];
    const missing = missingVariablesInEnvironment(data, environment.id);

    if (missing.length === 0) {
      return `${environment.name} looks healthy — ${environment.configured}/${environment.total} required variables are marked as configured there.`;
    }

    const otherEnvsWithIt = data.environments.filter((e) => e.id !== environment.id);
    const otherNote =
      otherEnvsWithIt.length > 0
        ? ` ${otherEnvsWithIt.map((e) => e.name).join(" and ")} ${otherEnvsWithIt.length === 1 ? "has" : "have"} more variables configured — compare on the Environments tab.`
        : "";

    return `Your ${environment.name} environment is missing ${missing.length} variable${missing.length === 1 ? "" : "s"}: ${describeMissing(missing)}.${otherNote}`;
  }

  if (/(what.*(chang|new)|latest scan|last scan)/.test(q)) {
    if (!data.lastScan) {
      return "No scans have run yet — click Rescan to run the first one.";
    }
    return `The latest scan ran ${data.lastScan.startedAt.toLocaleString()} and found ${
      data.repository.environmentVariables.length
    } total variable(s) in the codebase. There are currently ${data.critical} critical and ${data.warning} warning issue(s) open.`;
  }

  if (/(how (do|to) i fix|how (do|can) i (fix|resolve))/.test(q)) {
    const topIssue = data.issues[0];
    if (!topIssue) return "There's nothing to fix right now — no open issues.";
    const fix = getFixInstructions({
      type: topIssue.type,
      description: topIssue.description,
      variableKey: topIssue.environmentVariable?.key,
      environmentName: topIssue.environment?.name,
      environmentKind: topIssue.environment?.kind,
      filePath: topIssue.filePath,
      metadata: topIssue.metadata,
    });
    return `Top issue: ${topIssue.title}\n${fix.summary}${fix.example ? ` e.g. \`${fix.example}\`` : ""}`;
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

  if (/how many/.test(q)) {
    if (/critical/.test(q)) return `${data.critical} critical issue${data.critical === 1 ? "" : "s"} open.`;
    if (/warning/.test(q)) return `${data.warning} warning${data.warning === 1 ? "" : "s"} open.`;
    if (/(variable|env var)/.test(q))
      return `${data.repository.environmentVariables.length} variable(s) detected across the codebase.`;
    return `${data.critical + data.warning} open issue(s) total: ${data.critical} critical, ${data.warning} warning.`;
  }

  if (/(list|show).*(issue|problem)/.test(q)) {
    if (data.issues.length === 0) return "No open issues right now.";
    return `${data.issues.length} open issue(s):\n${formatIssueList(data.issues.slice(0, 10))}`;
  }

  const topIssue = data.issues[0];
  return `Configuration health is ${data.score}/100 (${data.critical} critical, ${data.warning} warning, ${data.healthy} healthy). ${
    topIssue ? `Top issue: ${topIssue.title}.` : "No open issues right now."
  } Ask "help" to see what else I can answer.`;
}
