/**
 * File types accepted in Data Leads and how each one is previewed (ADR-004).
 * Everything is rendered in the browser; no file is sent to a third party.
 */
export type FileKind = "spreadsheet" | "pdf" | "word" | "powerpoint" | "other";

const EXTENSION_KIND: Record<string, FileKind> = {
  xlsx: "spreadsheet",
  xls: "spreadsheet",
  csv: "spreadsheet",
  pdf: "pdf",
  docx: "word",
  pptx: "powerpoint",
};

/** For <input accept>. Legacy .doc/.ppt are left out: browsers can't render them. */
export const LEADS_ACCEPT = ".xlsx,.xls,.csv,.pdf,.docx,.pptx";

export const LEADS_MAX_BYTES = 25 * 1024 * 1024;

export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function fileKind(name: string): FileKind {
  return EXTENSION_KIND[extensionOf(name)] ?? "other";
}

export function isAcceptedLeadsFile(name: string): boolean {
  return fileKind(name) !== "other";
}

/** "2,4 MB" style size for the preview header. */
export function formatBytes(bytes: number, locale = "id-ID"): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}

/** Short label shown next to file names. */
export const KIND_LABEL: Record<FileKind, string> = {
  spreadsheet: "Excel / CSV",
  pdf: "PDF",
  word: "Word",
  powerpoint: "PowerPoint",
  other: "File",
};
