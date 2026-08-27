import type { VariableCategory } from "./types";

// Order matters: more specific keywords are checked before generic ones
// (e.g. "SUPABASE" before the generic "database" bucket, since a Supabase
// key often also contains "URL").
const RULES: Array<{ category: VariableCategory; keywords: string[] }> = [
  { category: "supabase", keywords: ["SUPABASE"] },
  { category: "stripe", keywords: ["STRIPE"] },
  { category: "redis", keywords: ["REDIS"] },
  { category: "storage", keywords: ["S3_", "BUCKET", "AWS_", "CLOUDINARY", "STORAGE"] },
  {
    category: "database",
    keywords: ["DATABASE", "POSTGRES", "MYSQL", "MONGO", "SQLITE", "PRISMA", "DB_"],
  },
  { category: "email", keywords: ["SMTP", "SENDGRID", "RESEND", "MAILGUN", "MAIL_"] },
  { category: "ai", keywords: ["OPENAI", "ANTHROPIC", "CLAUDE", "COHERE", "GEMINI"] },
  {
    category: "auth",
    keywords: ["AUTH", "JWT", "CLERK", "SESSION", "OAUTH", "NEXTAUTH", "PASSWORD"],
  },
  { category: "url", keywords: ["_URL", "URL_", "ENDPOINT", "APP_URL", "API_URL"] },
];

export const CATEGORY_LABELS: Record<VariableCategory, string> = {
  supabase: "Supabase client",
  stripe: "Stripe",
  redis: "Redis client",
  storage: "Object storage",
  database: "Database client",
  email: "Email/SMTP",
  ai: "AI provider",
  auth: "Authentication",
  url: "Application URL",
  other: "Application configuration",
};

export function classifyVariable(key: string): VariableCategory {
  const upper = key.toUpperCase();
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => upper.includes(keyword))) {
      return rule.category;
    }
  }
  return "other";
}
