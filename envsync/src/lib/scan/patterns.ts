export interface UsagePattern {
  name: string;
  /** Must be global and capture the variable name as its last capture group. */
  regex: RegExp;
  extensions: string[];
}

export const USAGE_PATTERNS: UsagePattern[] = [
  {
    name: "js-process-env-dot",
    regex: /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
  },
  {
    name: "js-process-env-bracket",
    regex: /process\.env\[\s*["'`]([A-Za-z_][A-Za-z0-9_]*)["'`]\s*\]/g,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
  },
  {
    name: "vite-import-meta-env",
    regex: /import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
  },
  {
    name: "python-os-getenv",
    regex: /os\.getenv\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g,
    extensions: [".py"],
  },
  {
    name: "python-os-environ-bracket",
    regex: /os\.environ\[\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\]/g,
    extensions: [".py"],
  },
  {
    name: "python-os-environ-get",
    regex: /os\.environ\.get\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']/g,
    extensions: [".py"],
  },
];

export const DEFAULT_IGNORED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  ".venv",
  "venv",
  "dist",
  "build",
  "out",
  "coverage",
  "__pycache__",
];

export const SCANNABLE_EXTENSIONS = Array.from(
  new Set(USAGE_PATTERNS.flatMap((p) => p.extensions))
);

export function isPublicVariable(key: string): boolean {
  return key.startsWith("NEXT_PUBLIC_") || key.startsWith("VITE_") || key.startsWith("REACT_APP_");
}

export function shouldScanPath(path: string): boolean {
  const segments = path.split("/");
  if (segments.some((segment) => DEFAULT_IGNORED_DIRS.includes(segment))) return false;
  return SCANNABLE_EXTENSIONS.some((ext) => path.endsWith(ext));
}
