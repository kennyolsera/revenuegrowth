// ============================================================================
// Online Order report — single source of truth for the field set.
// Drives the form, the importer, the CSV export, and the template so they can
// never drift apart.
// ============================================================================

export type OOKind = "text" | "date" | "count" | "amount";

export interface OOField {
  key: string;
  label: string;
  kind: OOKind;
}

export const OO_FIELDS: OOField[] = [
  { key: "store", label: "Store", kind: "text" },
  { key: "url", label: "URL", kind: "text" },
  { key: "last_trans_date", label: "Last Trans Date", kind: "date" },
  { key: "amount_pos_order", label: "Amount POS Order", kind: "amount" },
  { key: "amount_online_order", label: "Amount Online Order", kind: "amount" },
  { key: "total_online_order", label: "Total Online Order", kind: "amount" },
  { key: "count_delivery", label: "Count Delivery", kind: "count" },
  { key: "amount_delivery", label: "Amount Delivery", kind: "amount" },
  { key: "total_delivery", label: "Total Delivery", kind: "amount" },
  { key: "count_takeaway", label: "Count Takeaway", kind: "count" },
  { key: "amount_takeaway", label: "Amount Takeaway", kind: "amount" },
  { key: "total_takeaway", label: "Total Takeaway", kind: "amount" },
  { key: "count_dinein", label: "Count Dine-in", kind: "count" },
  { key: "amount_dinein", label: "Amount Dine-in", kind: "amount" },
  { key: "total_dinein", label: "Total Dine-in", kind: "amount" },
  { key: "count_reservation", label: "Count Reservation", kind: "count" },
  { key: "amount_reservation", label: "Amount Reservation", kind: "amount" },
  { key: "total_reservation", label: "Total Reservation", kind: "amount" },
  { key: "trans_fee_delivery", label: "Trans Fee Delivery", kind: "amount" },
  { key: "trans_fee_takeaway", label: "Trans Fee Takeaway", kind: "amount" },
  { key: "trans_fee_dinein", label: "Trans Fee Dine-in", kind: "amount" },
  { key: "trans_fee_reservation", label: "Trans Fee Reservation", kind: "amount" },
  { key: "total_fee", label: "Total Fee", kind: "amount" },
];

/** Normalize a header/key for tolerant matching: strip everything non-alphanumeric. */
export function normHeader(s: any): string {
  return String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Normalized alias (key or label) → canonical field key. */
export const OO_HEADER_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const f of OO_FIELDS) {
    m[normHeader(f.key)] = f.key;
    m[normHeader(f.label)] = f.key;
  }
  return m;
})();

/** Parse a numeric cell (counts & amounts). Strips Rp / thousands formatting. */
export function parseNumber(v: any): number | null {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const digits = String(v).replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return null;
  const n = Number(digits);
  return Number.isNaN(n) ? null : n;
}
