export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Appends a short random suffix to keep organization slugs unique without a DB round-trip loop. */
export function uniqueSlug(input: string): string {
  const base = slugify(input) || "team";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
