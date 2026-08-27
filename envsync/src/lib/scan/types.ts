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
  | "supabase"
  | "stripe"
  | "redis"
  | "storage"
  | "auth"
  | "email"
  | "ai"
  | "url"
  | "other";

export interface DetectedVariable {
  key: string;
  isPublic: boolean;
  category: VariableCategory;
  usages: VariableUsageLocation[];
}

export interface ExampleFileEntry {
  key: string;
  lineNumber: number;
}
