export interface SourceFile {
  path: string;
  content: string;
}

export interface VariableUsageLocation {
  filePath: string;
  lineNumber: number;
}

export type VariableCategory =
  | "database"
  | "cache"
  | "storage"
  | "auth"
  | "email"
  | "sms"
  | "ai"
  | "payments"
  | "analytics"
  | "monitoring"
  | "ci"
  | "crm"
  | "search"
  | "feature-flags"
  | "maps"
  | "video"
  | "cms"
  | "security"
  | "blockchain"
  | "social"
  | "hosting"
  | "url"
  | "other";

export interface DetectedVariable {
  key: string;
  isPublic: boolean;
  category: VariableCategory;
  /** Best-guess vendor name (e.g. "Stripe", "Twilio"), when recognized. */
  provider?: string;
  usages: VariableUsageLocation[];
}

export interface ExampleFileEntry {
  key: string;
  lineNumber: number;
}
