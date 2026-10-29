/**
 * Specific notification copy (ADR-011): name the thing that changed instead of
 * "Record updated successfully". Falls back to a short neutral phrase when there's no name.
 */
type Lang = "id" | "en";
type Kind = "created" | "updated" | "deleted";

const COPY: Record<Lang, Record<Kind, [string, string]>> = {
  id: {
    created: ["“{name}” ditambahkan", "Data baru ditambahkan"],
    updated: ["Perubahan “{name}” tersimpan", "Perubahan tersimpan"],
    deleted: ["“{name}” dihapus", "Data dihapus"],
  },
  en: {
    created: ["“{name}” added", "New entry added"],
    updated: ["“{name}” updated", "Changes saved"],
    deleted: ["“{name}” deleted", "Entry deleted"],
  },
};

const NAME_KEYS = ["title", "name", "full_name", "merchant_name", "partner_name", "label", "file_name", "email", "feature"];

/** Best human label for a record-like object. */
export function recordName(obj: unknown): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  for (const k of NAME_KEYS) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim().length > 60 ? v.trim().slice(0, 57) + "..." : v.trim();
  }
  return "";
}

export function savedMsg(language: string, kind: Kind, name?: string): string {
  const [named, plain] = COPY[language === "id" ? "id" : "en"][kind];
  return name ? named.replace("{name}", name) : plain;
}

/** "Kopi Kenangan is now Processed" style message for a status change. */
export function statusMsg(language: string, name: string, status: string): string {
  if (language === "id") return name ? `Status “${name}”: ${status}` : `Status diubah: ${status}`;
  return name ? `“${name}” is now ${status}` : `Status changed to ${status}`;
}
