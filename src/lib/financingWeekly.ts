// ============================================================================
// Financing Loan — Weekly Performance domain logic
// Shared by the import dialog and the board dashboard. Kept framework-free so
// the parsing / reconciliation rules are easy to reason about and reuse.
// ============================================================================

export interface WeeklyReportRow {
  id?: string;
  period_label: string; // e.g. "Aug"
  year: number;
  month: number; // 1-12
  week_no: number; // 1..5
  // Funnel (counts)
  id_verification: number;
  facial_verification: number;
  bank_info_confirmation: number;
  loan_agreement_opened: number;
  loan_agreement_review: number;
  application_completed: number; // B
  total_attempts: number; // C
  // Conversion
  contract_verification_rejected: number;
  contract_verification_approved: number;
  new_loan: number; // D
  loan_dashboard: number;
  new_loan_per_working_day: number | null;
  activation_pct: number | null; // as given in sheet (D/A)
  // Finance (Rp)
  disbursed_amount: number;
  avg_disbursed_loan_amount: number | null;
  expected_fee: number | null; // F
  less_15: number | null; // G
  net_fee: number | null; // F-G
  commission_10: number | null;
}

type FieldKey = keyof WeeklyReportRow;
type CellKind = "count" | "amount" | "decimal";

/** Ordered matchers — first hit wins per row; longer/more specific keys first. */
const MATCHERS: { needle: string; field: FieldKey; kind: CellKind }[] = [
  { needle: "average disbursed loan amount", field: "avg_disbursed_loan_amount", kind: "amount" },
  { needle: "disbursed amount", field: "disbursed_amount", kind: "amount" },
  { needle: "id verification", field: "id_verification", kind: "count" },
  { needle: "facial verification", field: "facial_verification", kind: "count" },
  { needle: "bank info", field: "bank_info_confirmation", kind: "count" },
  { needle: "loan agreement opened", field: "loan_agreement_opened", kind: "count" },
  { needle: "loan agreement review", field: "loan_agreement_review", kind: "count" },
  { needle: "application completed", field: "application_completed", kind: "count" },
  { needle: "total attempts", field: "total_attempts", kind: "count" },
  { needle: "contract verification rejected", field: "contract_verification_rejected", kind: "count" },
  { needle: "contract verification approved", field: "contract_verification_approved", kind: "count" },
  { needle: "new loan / working", field: "new_loan_per_working_day", kind: "decimal" },
  { needle: "working day", field: "new_loan_per_working_day", kind: "decimal" },
  { needle: "new loan", field: "new_loan", kind: "count" },
  { needle: "loan dashboard", field: "loan_dashboard", kind: "count" },
  { needle: "activation", field: "activation_pct", kind: "decimal" },
  { needle: "expected fee", field: "expected_fee", kind: "amount" },
  { needle: "less 15", field: "less_15", kind: "amount" },
  { needle: "net fee", field: "net_fee", kind: "amount" },
  { needle: "commission", field: "commission_10", kind: "amount" },
];

function normalizeLabel(s: any): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ") // drop parentheticals like (B), (non-split payment)
    .replace(/[#%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "1.096.000.000" | 1096000000 → 1096000000 (integer). */
export function parseAmount(cell: any): number | null {
  if (cell === "" || cell === null || cell === undefined) return null;
  if (typeof cell === "number") return Math.round(cell);
  const digits = String(cell).replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return null;
  const n = Number(digits);
  return Number.isNaN(n) ? null : n;
}

export function parseCount(cell: any): number {
  return parseAmount(cell) ?? 0;
}

/** "1,40" | "0,07%" → 1.4 | 0.07 (comma is the decimal separator). */
export function parseDecimal(cell: any): number | null {
  if (cell === "" || cell === null || cell === undefined) return null;
  if (typeof cell === "number") return cell;
  const cleaned = String(cell).replace(/%/g, "").replace(/\./g, "").replace(",", ".").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function parseCell(cell: any, kind: CellKind): number | null {
  if (kind === "amount") return parseAmount(cell);
  if (kind === "decimal") return parseDecimal(cell);
  return parseCount(cell);
}

function emptyRow(base: { period_label: string; year: number; month: number; week_no: number }): WeeklyReportRow {
  return {
    ...base,
    id_verification: 0,
    facial_verification: 0,
    bank_info_confirmation: 0,
    loan_agreement_opened: 0,
    loan_agreement_review: 0,
    application_completed: 0,
    total_attempts: 0,
    contract_verification_rejected: 0,
    contract_verification_approved: 0,
    new_loan: 0,
    loan_dashboard: 0,
    new_loan_per_working_day: null,
    activation_pct: null,
    disbursed_amount: 0,
    avg_disbursed_loan_amount: null,
    expected_fee: null,
    less_15: null,
    net_fee: null,
    commission_10: null,
  };
}

/**
 * Parse the transposed "Weekly Performance" sheet (array-of-arrays) into one
 * row per week. Locates the "Week N" header to map columns, then reads each
 * known metric row. Values are stored exactly as supplied (import-as-is).
 */
export function parseWeeklySheet(
  aoa: any[][],
  meta: { period_label: string; year: number; month: number }
): { rows: WeeklyReportRow[]; matched: number; error: string | null } {
  // 1. Find the header row that declares the week columns
  let weekCols: { col: number; week: number }[] = [];
  for (const row of aoa) {
    const found: { col: number; week: number }[] = [];
    row.forEach((cell, col) => {
      const m = String(cell ?? "").match(/week\s*([1-9])/i);
      if (m) found.push({ col, week: Number(m[1]) });
    });
    if (found.length >= 2) {
      weekCols = found;
      break;
    }
  }
  if (weekCols.length === 0) {
    return { rows: [], matched: 0, error: "Could not find 'Week 1..N' header columns in the sheet." };
  }

  // 2. Build one row per week, seeded empty
  const byWeek = new Map<number, WeeklyReportRow>();
  for (const { week } of weekCols) {
    byWeek.set(week, emptyRow({ ...meta, week_no: week }));
  }

  // 3. Walk metric rows; match label in col 0 (or first non-empty cell)
  let matched = 0;
  for (const row of aoa) {
    const labelCell = row.find((c) => String(c ?? "").trim() !== "");
    const label = normalizeLabel(labelCell);
    if (!label) continue;
    const matcher = MATCHERS.find((mt) => label.includes(mt.needle));
    if (!matcher) continue;
    matched++;
    for (const { col, week } of weekCols) {
      const parsed = parseCell(row[col], matcher.kind);
      const target = byWeek.get(week)! as Record<string, number | null>;
      target[matcher.field] = parsed === null ? (matcher.kind === "count" ? 0 : null) : parsed;
    }
  }

  const rows = Array.from(byWeek.values()).sort((a, b) => a.week_no - b.week_no);
  return { rows, matched, error: null };
}

// ── Aggregation ─────────────────────────────────────────────────────────────
export interface WeeklyAggregate {
  attempts: number;
  applications: number;
  completionPct: number; // B/C
  newLoans: number;
  approved: number;
  rejected: number;
  approvalPct: number; // D / B (application → loan)
  disbursed: number;
  netFee: number;
  commission: number;
  expectedFee: number;
  funnel: { key: string; value: number }[];
}

export function aggregate(rows: WeeklyReportRow[]): WeeklyAggregate {
  const sum = (f: (r: WeeklyReportRow) => number) => rows.reduce((a, r) => a + f(r), 0);
  const attempts = sum((r) => r.total_attempts);
  const applications = sum((r) => r.application_completed);
  const newLoans = sum((r) => r.new_loan);
  const approved = sum((r) => r.contract_verification_approved);
  const rejected = sum((r) => r.contract_verification_rejected);
  return {
    attempts,
    applications,
    completionPct: attempts ? (applications / attempts) * 100 : 0,
    newLoans,
    approved,
    rejected,
    approvalPct: applications ? (newLoans / applications) * 100 : 0,
    disbursed: sum((r) => r.disbursed_amount),
    netFee: sum((r) => r.net_fee ?? 0),
    commission: sum((r) => r.commission_10 ?? 0),
    expectedFee: sum((r) => r.expected_fee ?? 0),
    funnel: [
      { key: "ID Verification", value: sum((r) => r.id_verification) },
      { key: "Facial Verification", value: sum((r) => r.facial_verification) },
      { key: "Bank Info Confirmation", value: sum((r) => r.bank_info_confirmation) },
      { key: "Loan Agreement Opened", value: sum((r) => r.loan_agreement_opened) },
      { key: "Loan Agreement Review", value: sum((r) => r.loan_agreement_review) },
      { key: "Application Completed", value: applications },
      { key: "Contract Approved / New Loan", value: newLoans },
      { key: "Loan Dashboard (activated)", value: sum((r) => r.loan_dashboard) },
    ],
  };
}

// ── Reconciliation flags (import-as-is → surface, don't mutate) ──────────────
export type FlagSeverity = "high" | "med" | "info";
export interface DataFlag {
  severity: FlagSeverity;
  title: string;
  detail: string;
}

export function computeFlags(rows: WeeklyReportRow[]): DataFlag[] {
  const flags: DataFlag[] = [];
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(Math.round(n));

  // 1. Average disbursed loan amount vs disbursed / new_loan
  for (const r of rows) {
    if (r.avg_disbursed_loan_amount && r.new_loan > 0 && r.disbursed_amount > 0) {
      const expected = r.disbursed_amount / r.new_loan;
      const diff = Math.abs(r.avg_disbursed_loan_amount - expected) / expected;
      if (diff > 0.25) {
        flags.push({
          severity: "high",
          title: `Week ${r.week_no}: "Average Disbursed Loan Amount" does not reconcile`,
          detail: `Reported Rp ${fmt(r.avg_disbursed_loan_amount)}, but Disbursed ÷ New Loan = Rp ${fmt(
            r.disbursed_amount
          )} ÷ ${r.new_loan} ≈ Rp ${fmt(expected)}.`,
        });
      }
    }
  }

  // 2. Effective fee-rate outlier across weeks
  const rates = rows
    .filter((r) => r.expected_fee && r.disbursed_amount > 0)
    .map((r) => ({ week: r.week_no, rate: (r.expected_fee! / r.disbursed_amount) * 100 }));
  if (rates.length >= 2) {
    const min = Math.min(...rates.map((x) => x.rate));
    const max = Math.max(...rates.map((x) => x.rate));
    if (min > 0 && max / min > 1.5) {
      const lo = rates.find((x) => x.rate === min)!;
      flags.push({
        severity: "med",
        title: "Effective fee rate is inconsistent across weeks",
        detail: `Fee ÷ Disbursed ranges from ${min.toFixed(1)}% (Week ${lo.week}) to ${max.toFixed(
          1
        )}%. Confirm whether a week's disbursement or fee is misstated.`,
      });
    }
  }

  // 3. Loan agreement opened = 0 but review > 0
  const openedTotal = rows.reduce((a, r) => a + r.loan_agreement_opened, 0);
  const reviewTotal = rows.reduce((a, r) => a + r.loan_agreement_review, 0);
  if (openedTotal === 0 && reviewTotal > 0) {
    flags.push({
      severity: "med",
      title: 'Pipeline logging gap: "Loan Agreement Opened" is 0 every week',
      detail: `Yet "Loan Agreement Review" totals ${reviewTotal}. An agreement cannot be reviewed before it is opened — an event is likely not being tracked.`,
    });
  }

  // 4. Activation base undefined
  if (rows.some((r) => r.activation_pct != null)) {
    flags.push({
      severity: "info",
      title: '"% Activation (D/A)" denominator is undefined',
      detail: "The active-merchant base A is not present in the report. Define A explicitly so the metric is auditable.",
    });
  }

  return flags;
}

/** The user's August 2026 sample, used when Supabase has no data yet. */
export const SAMPLE_WEEKLY: WeeklyReportRow[] = [
  { period_label: "Aug", year: 2026, month: 8, week_no: 1, id_verification: 17, facial_verification: 9, bank_info_confirmation: 1, loan_agreement_opened: 0, loan_agreement_review: 0, application_completed: 8, total_attempts: 53, contract_verification_rejected: 1, contract_verification_approved: 7, new_loan: 7, loan_dashboard: 6, new_loan_per_working_day: 1.4, activation_pct: 0.07, disbursed_amount: 1096000000, avg_disbursed_loan_amount: 1045500000, expected_fee: 153105000, less_15: 22965750, net_fee: 130139250, commission_10: 13013925 },
  { period_label: "Aug", year: 2026, month: 8, week_no: 2, id_verification: 10, facial_verification: 5, bank_info_confirmation: 5, loan_agreement_opened: 0, loan_agreement_review: 4, application_completed: 12, total_attempts: 52, contract_verification_rejected: 0, contract_verification_approved: 12, new_loan: 12, loan_dashboard: 13, new_loan_per_working_day: 2.4, activation_pct: 0.11, disbursed_amount: 688000000, avg_disbursed_loan_amount: 148300000, expected_fee: 175316000, less_15: 26297400, net_fee: 149018600, commission_10: 14901860 },
  { period_label: "Aug", year: 2026, month: 8, week_no: 3, id_verification: 13, facial_verification: 8, bank_info_confirmation: 10, loan_agreement_opened: 0, loan_agreement_review: 1, application_completed: 18, total_attempts: 75, contract_verification_rejected: 5, contract_verification_approved: 13, new_loan: 13, loan_dashboard: 4, new_loan_per_working_day: 2.4, activation_pct: 0.12, disbursed_amount: 574000000, avg_disbursed_loan_amount: 295150000, expected_fee: 135149000, less_15: 20272350, net_fee: 114876650, commission_10: 11487665 },
  { period_label: "Aug", year: 2026, month: 8, week_no: 4, id_verification: 11, facial_verification: 7, bank_info_confirmation: 2, loan_agreement_opened: 0, loan_agreement_review: 1, application_completed: 11, total_attempts: 60, contract_verification_rejected: 2, contract_verification_approved: 9, new_loan: 9, loan_dashboard: 6, new_loan_per_working_day: 1.8, activation_pct: 0.09, disbursed_amount: 265000000, avg_disbursed_loan_amount: 148000000, expected_fee: 69409000, less_15: 10411350, net_fee: 58997650, commission_10: 5899765 },
];
