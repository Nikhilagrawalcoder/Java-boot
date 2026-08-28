import { USAGE_PATTERNS, isPublicVariable, shouldScanPath } from "./patterns";
import { classifyVariable } from "./classify";
import { findProvider } from "./providers";
import type { DetectedVariable, SourceFile } from "./types";

function lineNumberAt(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10 /* \n */) line++;
  }
  return line;
}

/**
 * Scans a set of source files for environment-variable usage patterns and
 * returns a normalized, deduplicated list. Never reads or returns variable
 * *values* — only key names and where they're referenced.
 */
export function scanSourceFiles(files: SourceFile[]): DetectedVariable[] {
  const byKey = new Map<string, DetectedVariable>();

  for (const file of files) {
    if (!shouldScanPath(file.path)) continue;

    for (const pattern of USAGE_PATTERNS) {
      if (!pattern.extensions.some((ext) => file.path.endsWith(ext))) continue;

      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(file.content)) !== null) {
        const key = match[match.length - 1];
        if (!key) continue;

        const lineNumber = lineNumberAt(file.content, match.index);
        const existing = byKey.get(key);

        if (existing) {
          const alreadyRecorded = existing.usages.some(
            (u) => u.filePath === file.path && u.lineNumber === lineNumber
          );
          if (!alreadyRecorded) {
            existing.usages.push({ filePath: file.path, lineNumber });
          }
        } else {
          byKey.set(key, {
            key,
            isPublic: isPublicVariable(key),
            category: classifyVariable(key),
            provider: findProvider(key)?.name,
            usages: [{ filePath: file.path, lineNumber }],
          });
        }
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
}
