export type ScorableIssueType =
  | "MISSING_VARIABLE"
  | "MISSING_FROM_EXAMPLE"
  | "UNDOCUMENTED_IN_EXAMPLE"
  | "SECRET_EXPOSURE"
  | "UNUSED_VARIABLE"
  | "ENV_INCONSISTENCY";

export type ScorableSeverity = "CRITICAL" | "WARNING" | "INFO";
export type ScorableEnvironmentKind = "LOCAL" | "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export interface ScorableIssue {
  type: ScorableIssueType;
  severity: ScorableSeverity;
  environmentKind?: ScorableEnvironmentKind;
}

export interface ScoreBreakdownEntry {
  label: string;
  delta: number;
}

export interface HealthScoreResult {
  score: number;
  breakdown: ScoreBreakdownEntry[];
  critical: number;
  warning: number;
  healthy: number;
}

const MISSING_VARIABLE_PENALTY: Record<ScorableEnvironmentKind, number> = {
  PRODUCTION: -20,
  STAGING: -10,
  DEVELOPMENT: -6,
  LOCAL: -4,
};

const MISSING_VARIABLE_LABEL: Record<ScorableEnvironmentKind, string> = {
  PRODUCTION: "Missing production variable",
  STAGING: "Missing staging variable",
  DEVELOPMENT: "Missing development variable",
  LOCAL: "Missing local variable",
};

function penaltyAndLabel(issue: ScorableIssue): { delta: number; label: string } {
  switch (issue.type) {
    case "MISSING_VARIABLE": {
      const kind = issue.environmentKind ?? "PRODUCTION";
      return { delta: MISSING_VARIABLE_PENALTY[kind], label: MISSING_VARIABLE_LABEL[kind] };
    }
    case "SECRET_EXPOSURE":
      return issue.severity === "CRITICAL"
        ? { delta: -15, label: "Secret exposure" }
        : { delta: -5, label: "Possible hardcoded credential" };
    case "MISSING_FROM_EXAMPLE":
      return { delta: -5, label: "Missing .env.example variable" };
    case "UNDOCUMENTED_IN_EXAMPLE":
      return { delta: -2, label: "Unused .env.example entry" };
    case "UNUSED_VARIABLE":
      return { delta: -2, label: "Possibly unused variable" };
    case "ENV_INCONSISTENCY":
      return { delta: -8, label: "Environment inconsistency" };
  }
}

/**
 * Computes a transparent 0-100 configuration health score. `totalChecks` is
 * the number of variable × environment combinations considered, used only to
 * derive the "healthy" count for display (score itself comes purely from
 * issue penalties, so it never depends on how many variables exist).
 */
export function computeHealthScore(issues: ScorableIssue[], totalChecks: number): HealthScoreResult {
  const grouped = new Map<string, { delta: number; count: number }>();

  for (const issue of issues) {
    const { delta, label } = penaltyAndLabel(issue);
    const existing = grouped.get(label);
    if (existing) {
      existing.delta += delta;
      existing.count += 1;
    } else {
      grouped.set(label, { delta, count: 1 });
    }
  }

  const breakdown: ScoreBreakdownEntry[] = Array.from(grouped.entries()).map(([label, g]) => ({
    label: g.count > 1 ? `${label} ×${g.count}` : label,
    delta: g.delta,
  }));

  const critical = issues.filter((i) => i.severity === "CRITICAL").length;
  const warning = issues.filter((i) => i.severity === "WARNING").length;

  const hasCriticalIssue = critical > 0;
  const hasMissingFromExample = issues.some((i) => i.type === "MISSING_FROM_EXAMPLE");

  if (!hasCriticalIssue && !hasMissingFromExample) {
    breakdown.push({ label: "All critical variables documented", delta: 10 });
  }

  const rawScore = 100 + breakdown.reduce((sum, entry) => sum + entry.delta, 0);
  const score = Math.max(0, Math.min(100, rawScore));

  const healthy = Math.max(0, totalChecks - critical - warning);

  return { score, breakdown, critical, warning, healthy };
}
