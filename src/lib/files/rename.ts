/** Split "Report Q3.final.xlsx" into { base: "Report Q3.final", ext: ".xlsx" }. */
export function splitFileName(name: string): { base: string; ext: string } {
  const i = name.lastIndexOf(".");
  if (i <= 0 || i === name.length - 1) return { base: name, ext: "" };
  return { base: name.slice(0, i), ext: name.slice(i) };
}

export const MAX_BASE_LENGTH = 180;

/**
 * Clean a user-typed base name: no path separators or control characters, no
 * leading/trailing dots or spaces, collapsed whitespace. Returns "" when nothing
 * usable is left.
 */
export function cleanBaseName(input: string): string {
  return input
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+|\.+$/g, "")
    .trim()
    .slice(0, MAX_BASE_LENGTH);
}
