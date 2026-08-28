import type { IssueType } from "@prisma/client";

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  MISSING_VARIABLE: "Missing variable",
  MISSING_FROM_EXAMPLE: "Missing from .env.example",
  UNDOCUMENTED_IN_EXAMPLE: "Undocumented in .env.example",
  SECRET_EXPOSURE: "Secret exposure",
  UNUSED_VARIABLE: "Unused variable",
  ENV_INCONSISTENCY: "Environment inconsistency",
};
