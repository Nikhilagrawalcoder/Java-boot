export interface FixInstructionContext {
  type: string;
  description: string;
  variableKey?: string | null;
  environmentName?: string | null;
  environmentKind?: string | null;
  filePath?: string | null;
  metadata?: unknown;
}

export interface FixInstructions {
  summary: string;
  example?: string;
}

function metadataString(metadata: unknown, key: string): string | undefined {
  if (metadata && typeof metadata === "object" && key in metadata) {
    const value = (metadata as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export function getFixInstructions(issue: FixInstructionContext): FixInstructions {
  switch (issue.type) {
    case "MISSING_VARIABLE": {
      const env = issue.environmentName ?? "this environment";
      const kindLower = (issue.environmentKind ?? "staging").toLowerCase();
      return {
        summary: `Add ${issue.variableKey ?? "this variable"} to your ${env} environment.`,
        example: `${issue.variableKey ?? "VARIABLE_NAME"}=your-${kindLower}-value`,
      };
    }
    case "MISSING_FROM_EXAMPLE":
      return {
        summary: `Add ${issue.variableKey ?? "this variable"} to .env.example so new contributors know it's required. Never put a real value in .env.example — leave it blank or use a placeholder.`,
        example: `${issue.variableKey ?? "VARIABLE_NAME"}=`,
      };
    case "UNDOCUMENTED_IN_EXAMPLE":
      return {
        summary: `.env.example declares ${issue.variableKey ?? "this variable"}, but no usage was found in the current scan. If it's no longer needed, remove it from .env.example. If it's still used, check that the usage pattern is one EnvSync recognizes.`,
      };
    case "UNUSED_VARIABLE":
      return {
        summary: `${issue.variableKey ?? "This variable"} was detected in a previous scan but not in this one. Confirm it's no longer referenced, then remove it from your environment configuration.`,
      };
    case "SECRET_EXPOSURE": {
      const preview = metadataString(issue.metadata, "maskedPreview");
      return {
        summary: issue.description,
        example: preview ? `Found: ${preview}` : undefined,
      };
    }
    default:
      return { summary: issue.description };
  }
}
