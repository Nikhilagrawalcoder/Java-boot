export type SecretSeverity = "CRITICAL" | "WARNING";

export interface SecretFinding {
  filePath: string;
  lineNumber: number;
  secretType: string;
  severity: SecretSeverity;
  maskedPreview: string;
  recommendedAction: string;
}

interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: SecretSeverity;
  recommendedAction: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "Stripe secret key",
    regex: /\bsk_live_[A-Za-z0-9]{10,}\b/g,
    severity: "CRITICAL",
    recommendedAction:
      "Move this value into an environment variable and rotate the exposed credential in the Stripe dashboard.",
  },
  {
    name: "Stripe restricted key",
    regex: /\brk_live_[A-Za-z0-9]{10,}\b/g,
    severity: "CRITICAL",
    recommendedAction:
      "Move this value into an environment variable and rotate the exposed restricted key in the Stripe dashboard.",
  },
  {
    name: "AWS access key ID",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    severity: "CRITICAL",
    recommendedAction:
      "Move this value into an environment variable, then deactivate and rotate this access key in IAM.",
  },
  {
    name: "GitHub personal access token",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
    severity: "CRITICAL",
    recommendedAction:
      "Revoke this token in GitHub → Settings → Developer settings, then move any tokens into environment variables.",
  },
  {
    name: "Private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/g,
    severity: "CRITICAL",
    recommendedAction:
      "Remove this key from source control immediately, rotate it, and store it in a secrets manager or environment variable.",
  },
];

// Catches values assigned to credential-shaped variable names that don't
// match a known vendor prefix above (e.g. a raw API key with no recognizable
// format). Lower confidence, so it's a WARNING rather than CRITICAL.
const SUSPICIOUS_ASSIGNMENT =
  /\b(?:const|let|var)\s+\w*(?:key|secret|token|password|credential)\w*\s*[:=]\s*["'`]([^"'`]{16,})["'`]/gi;

const PLACEHOLDER_HINTS = ["your", "example", "changeme", "placeholder", "xxxx", "<", "{{", "todo"];

function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_HINTS.some((hint) => lower.includes(hint));
}

export function maskSecret(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 8)}${"•".repeat(12)}${value.slice(-4)}`;
}

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

const IGNORED_DIRS = ["node_modules", ".git", ".next", "dist", "build", "out", "coverage"];
const IGNORED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".map",
];
const IGNORED_FILES = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

export function shouldScanForSecrets(path: string): boolean {
  const segments = path.split("/");
  if (segments.some((segment) => IGNORED_DIRS.includes(segment))) return false;
  const fileName = segments[segments.length - 1];
  if (IGNORED_FILES.includes(fileName)) return false;
  if (IGNORED_EXTENSIONS.some((ext) => path.endsWith(ext))) return false;
  return true;
}

export function detectSecrets(files: { path: string; content: string }[]): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const file of files) {
    if (!shouldScanForSecrets(file.path)) continue;

    for (const pattern of SECRET_PATTERNS) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(file.content)) !== null) {
        findings.push({
          filePath: file.path,
          lineNumber: lineNumberAt(file.content, match.index),
          secretType: pattern.name,
          severity: pattern.severity,
          maskedPreview: maskSecret(match[0]),
          recommendedAction: pattern.recommendedAction,
        });
      }
    }

    const assignmentRegex = new RegExp(SUSPICIOUS_ASSIGNMENT.source, SUSPICIOUS_ASSIGNMENT.flags);
    let assignmentMatch: RegExpExecArray | null;
    while ((assignmentMatch = assignmentRegex.exec(file.content)) !== null) {
      const value = assignmentMatch[1];
      if (looksLikePlaceholder(value)) continue;
      // Skip if a known vendor pattern above already matched this exact value.
      const alreadyCovered = SECRET_PATTERNS.some((p) => new RegExp(p.regex.source).test(value));
      if (alreadyCovered) continue;
      findings.push({
        filePath: file.path,
        lineNumber: lineNumberAt(file.content, assignmentMatch.index),
        secretType: "Possible hardcoded credential",
        severity: "WARNING",
        maskedPreview: maskSecret(value),
        recommendedAction:
          "Move this value into an environment variable — hardcoded credentials in source are visible to anyone with repository access.",
      });
    }
  }

  return findings;
}
