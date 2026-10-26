/**
 * Returns `next` only if it is a same-site relative path; otherwise `fallback`.
 *
 * Email links carry a `next` parameter that decides where the user lands after
 * the link is verified. Without this check, a crafted link could send someone
 * to another site right after signing them in (open redirect).
 */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  let value: string;
  try {
    value = decodeURIComponent(next).trim();
  } catch {
    return fallback;
  }
  // Must start with a single "/" — rejects "//evil.com", "https://…", "javascript:…"
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  // Browsers treat "\" like "/" in URLs ("/\evil.com"); reject control characters too.
  if (/[\\\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
