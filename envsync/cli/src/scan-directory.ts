import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, sep } from "path";
import type { SourceFile } from "../../src/lib/scan/types";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  "venv",
  ".venv",
  "__pycache__",
]);

const MAX_FILE_SIZE_BYTES = 500_000;

/** Reads every text file under `root` (skipping the usual noise dirs) into memory. */
export function readProjectFiles(root: string): SourceFile[] {
  const files: SourceFile[] = [];

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);

      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile() && stat.size <= MAX_FILE_SIZE_BYTES) {
        try {
          const content = readFileSync(fullPath, "utf8");
          files.push({ path: relative(root, fullPath).split(sep).join("/"), content });
        } catch {
          // Skip binary or unreadable files.
        }
      }
    }
  }

  walk(root);
  return files;
}
