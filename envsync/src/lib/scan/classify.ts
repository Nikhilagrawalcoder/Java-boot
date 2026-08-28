import type { VariableCategory } from "./types";
import { findProvider } from "./providers";

export { CATEGORY_LABELS, findProvider, PROVIDERS, PROVIDER_COUNT, KNOWN_ENV_KEYS } from "./providers";

// Fallback keyword rules for env vars that don't match any of the ~500
// known vendors in the provider database, but still hint at a category
// (e.g. a home-grown "DB_HOST" var, or a generic "JWT_SECRET"). Checked
// only when `findProvider` finds nothing more specific.
const FALLBACK_RULES: Array<{ category: VariableCategory; keywords: string[] }> = [
  {
    category: "database",
    keywords: ["DATABASE", "DB_", "SQL"],
  },
  { category: "cache", keywords: ["CACHE", "QUEUE"] },
  { category: "storage", keywords: ["BUCKET", "STORAGE", "S3_"] },
  {
    category: "auth",
    keywords: ["AUTH", "JWT", "SESSION", "OAUTH", "PASSWORD", "SECRET_KEY"],
  },
  { category: "email", keywords: ["SMTP", "MAIL_"] },
  { category: "url", keywords: ["_URL", "URL_", "ENDPOINT", "APP_URL", "API_URL"] },
];

export function classifyVariable(key: string): VariableCategory {
  const provider = findProvider(key);
  if (provider) return provider.category;

  const upper = key.toUpperCase();
  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some((keyword) => upper.includes(keyword))) {
      return rule.category;
    }
  }
  return "other";
}
