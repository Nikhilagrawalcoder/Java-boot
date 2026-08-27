import type { DetectedVariable, ExampleFileEntry } from "./types";

const ENV_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/;

/** Parses a `.env.example`-style file into declared keys, ignoring comments and blank lines. */
export function parseEnvExample(content: string): ExampleFileEntry[] {
  const entries: ExampleFileEntry[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = ENV_LINE.exec(line);
    if (match) {
      entries.push({ key: match[1], lineNumber: index + 1 });
    }
  });

  return entries;
}

export interface ExampleDiff {
  /** Used in code, but not declared in .env.example. */
  missingFromExample: DetectedVariable[];
  /** Declared in .env.example, but no usage found in the current codebase. */
  undocumentedInExample: ExampleFileEntry[];
}

export function diffAgainstExample(
  detected: DetectedVariable[],
  example: ExampleFileEntry[]
): ExampleDiff {
  const exampleKeys = new Set(example.map((e) => e.key));
  const detectedKeys = new Set(detected.map((d) => d.key));

  return {
    missingFromExample: detected.filter((d) => !exampleKeys.has(d.key)),
    undocumentedInExample: example.filter((e) => !detectedKeys.has(e.key)),
  };
}
