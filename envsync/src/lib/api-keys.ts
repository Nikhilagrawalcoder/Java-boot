import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "envsk_live_";
/** Characters shown back to the user for identifying a key in a list — the rest is never seen again. */
const VISIBLE_PREFIX_LENGTH = KEY_PREFIX.length + 8;

export interface GeneratedApiKey {
  /** Full plaintext key. Shown to the user exactly once, at creation time. */
  plaintext: string;
  /** Short, safe-to-store prefix used to identify this key in the UI later. */
  keyPrefix: string;
  /** One-way SHA-256 hex digest, the only form ever persisted. */
  keyHash: string;
}

export function generateApiKey(): GeneratedApiKey {
  const plaintext = `${KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
  return {
    plaintext,
    keyPrefix: plaintext.slice(0, VISIBLE_PREFIX_LENGTH),
    keyHash: hashApiKey(plaintext),
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function looksLikeApiKey(value: string): boolean {
  return value.startsWith(KEY_PREFIX);
}
