import type { ScorableEnvironmentKind, ScorableIssue } from "./scoring";

export interface CoverageEnvironment {
  id: string;
  name: string;
  kind: ScorableEnvironmentKind;
}

export interface CoverageVariable {
  id: string;
  key: string;
}

export interface CoverageState {
  environmentId: string;
  environmentVariableId: string;
  isConfigured: boolean;
}

export interface MissingVariableEntry {
  environmentId: string;
  environmentName: string;
  environmentKind: ScorableEnvironmentKind;
  variableId: string;
  variableKey: string;
}

export interface EnvironmentCoverageResult {
  /** Every (environment, variable) pair that isn't marked configured. */
  missing: MissingVariableEntry[];
  /** Per-environment healthy/total counts, for the dashboard's environment cards. */
  byEnvironment: Array<{ environmentId: string; name: string; configured: number; total: number }>;
  /** Ready to feed into computeHealthScore. */
  scorableIssues: ScorableIssue[];
}

/**
 * Compares the variables currently detected in code against each manually
 * configured Environment's variable states. A variable with no state row at
 * all for a given environment counts as not configured — an undocumented
 * environment is exactly as broken as one you know is missing something.
 */
export function computeEnvironmentCoverage(
  variables: CoverageVariable[],
  environments: CoverageEnvironment[],
  states: CoverageState[]
): EnvironmentCoverageResult {
  const configuredSet = new Set(
    states.filter((s) => s.isConfigured).map((s) => `${s.environmentId}:${s.environmentVariableId}`)
  );

  const missing: MissingVariableEntry[] = [];
  const byEnvironment: EnvironmentCoverageResult["byEnvironment"] = [];

  for (const env of environments) {
    let configuredCount = 0;
    for (const variable of variables) {
      const isConfigured = configuredSet.has(`${env.id}:${variable.id}`);
      if (isConfigured) {
        configuredCount++;
      } else {
        missing.push({
          environmentId: env.id,
          environmentName: env.name,
          environmentKind: env.kind,
          variableId: variable.id,
          variableKey: variable.key,
        });
      }
    }
    byEnvironment.push({
      environmentId: env.id,
      name: env.name,
      configured: configuredCount,
      total: variables.length,
    });
  }

  const scorableIssues: ScorableIssue[] = missing.map((m) => ({
    type: "MISSING_VARIABLE",
    severity: m.environmentKind === "PRODUCTION" || m.environmentKind === "STAGING" ? "CRITICAL" : "WARNING",
    environmentKind: m.environmentKind,
  }));

  return { missing, byEnvironment, scorableIssues };
}
