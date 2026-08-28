// ============================================================================
// Financing Loan — Performance report domain logic
// Handles the GoTyme "Monthly Performance" export (metrics as rows, months as
// columns) AND the weekly variant (Week N columns). Stored as-is; anomalies are
// surfaced by computeFlags, never mutated. Validated against the real workbook.
// ============================================================================

export type PeriodType = "month" | "week" | "ltd" | "yearly" | "ytd";

export interface FinancingReportRow {
  id?: string;
  period_type: PeriodType;
  period_key: string; // unique upsert key
  period_label: string; // e.g. "Aug 2026", "YTD 2026"
  year: number;
  month: number | null; // 1-12 for month/week
  week_no: number | null; // 1..6 for week
  sort_key: number;
  // Reach / base
  days: number | null;
  working_days: number | null;
  offer_unique_merchants: number | null;
  business_owner_a: number | null; // A (activation denominator)
  total_site_visits: number | null;
  less_active_loan: number | null;
  new_applicant_visits: number | null;
  unique_merchant_ids: number | null;
  // Application journey
  intro_page: number | null;
  slider_activity: number | null;
  otp_verification: number | null;
  id_verification: number | null;
  facial_verification: number | null;
  bank_info_confirmation: number | null;
  loan_agreement_opened: number | null;
  loan_agreement_review: number | null;
  application_completed: number | null; // B
  total_attempts: number | null; // C
  // Conversion
  contract_rejected: number | null;
  contract_approved: number | null;
  new_loan: number | null; // D
  loan_dashboard: number | null;
  new_loan_per_working_day: number | null;
  // Finance (Rp)
  disbursed_amount: number | null;
  avg_disbursed_loan_amount: number | null;
  expected_fee: number | null; // F
  less_15: number | null; // G
  net_fee: number | null; // F-G
  commission_10: number | null;
}

type MetricKey = Exclude<
  keyof FinancingReportRow,
  "id" | "period_type" | "period_key" | "period_label" | "year" | "month" | "week_no" | "sort_key"
>;
type CellKind = "count" | "amount" | "decimal";

/** Ordered label matchers — first hit per row wins; specific needles first. */
const MATCHERS: { needle: string; field: MetricKey; kind: CellKind }[] = [
  { needle: "average disbursed loan amount", field: "avg_disbursed_loan_amount", kind: "amount" },
  { needle: "disbursed amount", field: "disbursed_amount", kind: "amount" },
  { needle: "expected fee", field: "expected_fee", kind: "amount" },
  { needle: "net fee", field: "net_fee", kind: "amount" },
  { needle: "commission", field: "commission_10", kind: "amount" },
  { needle: "less 15", field: "less_15", kind: "amount" },
  { needle: "new loan / working", field: "new_loan_per_working_day", kind: "decimal" },
  { needle: "working days", field: "working_days", kind: "count" },
  { needle: "new loan", field: "new_loan", kind: "count" },
  { needle: "loan dashboard", field: "loan_dashboard", kind: "count" },
  { needle: "contract verification rejected", field: "contract_rejected", kind: "count" },
  { needle: "contract verification approved", field: "contract_approved", kind: "count" },
  { needle: "offer to unique merchants", field: "offer_unique_merchants", kind: "count" },
  { needle: "business owner", field: "business_owner_a", kind: "count" },
  { needle: "total site visits", field: "total_site_visits", kind: "count" },
  { needle: "already has active loan", field: "less_active_loan", kind: "count" },
  { needle: "new applicant", field: "new_applicant_visits", kind: "count" },
  { needle: "unique merchant ids", field: "unique_merchant_ids", kind: "count" },
  { needle: "introduction page", field: "intro_page", kind: "count" },
  { needle: "slider activity", field: "slider_activity", kind: "count" },
  { needle: "otp verification", field: "otp_verification", kind: "count" },
  { needle: "id verification", field: "id_verification", kind: "count" },
  { needle: "facial verification", field: "facial_verification", kind: "count" },
  { needle: "bank info", field: "bank_info_confirmation", kind: "count" },
  { needle: "loan agreement opened", field: "loan_agreement_opened", kind: "count" },
  { needle: "loan agreement review", field: "loan_agreement_review", kind: "count" },
  { needle: "application completed", field: "application_completed", kind: "count" },
  { needle: "total attempts", field: "total_attempts", kind: "count" },
  { needle: "days", field: "days", kind: "count" }, // last: many labels contain "days"
];

const MONTHS_ABBR = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeLabel(s: any): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[#%:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAmount(cell: any): number | null {
  if (cell === "" || cell === null || cell === undefined) return null;
  if (typeof cell === "number") return Math.round(cell);
  const digits = String(cell).replace(/[^\d-]/g, "");
  if (!digits || digits === "-") return null;
  const n = Number(digits);
  return Number.isNaN(n) ? null : n;
}

export function parseDecimal(cell: any): number | null {
  if (cell === "" || cell === null || cell === undefined) return null;
  if (typeof cell === "number") return cell;
  const cleaned = String(cell).replace(/%/g, "").replace(/\./g, "").replace(",", ".").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function parseCell(cell: any, kind: CellKind): number | null {
  if (kind === "decimal") return parseDecimal(cell);
  return parseAmount(cell); // count + amount both integer-ish
}

function blankMetrics(): Record<MetricKey, number | null> {
  return {
    days: null, working_days: null, offer_unique_merchants: null, business_owner_a: null,
    total_site_visits: null, less_active_loan: null, new_applicant_visits: null, unique_merchant_ids: null,
    intro_page: null, slider_activity: null, otp_verification: null, id_verification: null,
    facial_verification: null, bank_info_confirmation: null, loan_agreement_opened: null,
    loan_agreement_review: null, application_completed: null, total_attempts: null,
    contract_rejected: null, contract_approved: null, new_loan: null, loan_dashboard: null,
    new_loan_per_working_day: null, disbursed_amount: null, avg_disbursed_loan_amount: null,
    expected_fee: null, less_15: null, net_fee: null, commission_10: null,
  };
}

interface ColumnTarget {
  col: number;
  period_type: PeriodType;
  period_label: string;
  year: number;
  month: number | null;
  week_no: number | null;
  sort_key: number;
  period_key: string;
}

export interface ParseResult {
  rows: FinancingReportRow[];
  matched: number;
  format: "monthly" | "weekly" | "unknown";
  error: string | null;
}

/**
 * Parse a financing performance workbook (array-of-arrays). Auto-detects the
 * monthly layout (month-name header) or weekly layout (Week N header), plus the
 * Launch-to-Date / Yearly / YTD summary columns. `year` seeds the primary block.
 */
export function parseFinancingWorkbook(aoa: any[][], primaryYear: number): ParseResult {
  const columns: ColumnTarget[] = [];

  // ── Detect month-name header row ──────────────────────────────────────
  let monthHeaderRow = -1;
  let monthCols: { col: number; m: number }[] = [];
  aoa.forEach((row, ri) => {
    if (monthHeaderRow !== -1) return;
    const found: { col: number; m: number }[] = [];
    row.forEach((cell, col) => {
      const norm = String(cell ?? "").trim().toLowerCase().slice(0, 3);
      const m = MONTHS_ABBR.indexOf(norm);
      if (m !== -1) found.push({ col, m: m + 1 });
    });
    if (found.length >= 6) {
      monthHeaderRow = ri;
      monthCols = found;
    }
  });

  // ── Weekly fallback: Week N header ────────────────────────────────────
  let weekCols: { col: number; w: number }[] = [];
  if (monthHeaderRow === -1) {
    for (const row of aoa) {
      const found: { col: number; w: number }[] = [];
      row.forEach((cell, col) => {
        const m = String(cell ?? "").match(/week\s*([1-9])/i);
        if (m) found.push({ col, w: Number(m[1]) });
      });
      if (found.length >= 2) {
        weekCols = found;
        break;
      }
    }
  }

  const format: ParseResult["format"] =
    monthHeaderRow !== -1 ? "monthly" : weekCols.length ? "weekly" : "unknown";
  if (format === "unknown") {
    return { rows: [], matched: 0, format, error: "Could not find month or week header columns." };
  }

  // ── Summary columns (Launch to Date / Yearly / Year to Date) ──────────
  const summaryDefs: { needle: string; type: PeriodType; label: string; yearOffset: number }[] = [
    { needle: "launch to date", type: "ltd", label: "Launch to Date", yearOffset: 0 },
    { needle: "year to date", type: "ytd", label: "YTD", yearOffset: 0 },
    { needle: "yearly", type: "yearly", label: "Yearly", yearOffset: -1 },
  ];
  for (const row of aoa) {
    for (let col = 0; col < row.length; col++) {
      const norm = normalizeLabel(row[col]);
      for (const s of summaryDefs) {
        if (norm === s.needle && !columns.some((c) => c.period_type === s.type)) {
          const y = primaryYear + s.yearOffset;
          columns.push({
            col, period_type: s.type, period_label: `${s.label} ${y}`, year: y,
            month: null, week_no: null, sort_key: 900000 + col, period_key: `${s.type}:${y}`,
          });
        }
      }
    }
  }

  if (format === "monthly") {
    // First contiguous Jan..Dec run = primary year; a following run = prior year.
    let blockYear = primaryYear;
    let prevM = 0;
    for (const { col, m } of monthCols) {
      if (m <= prevM) blockYear = primaryYear - 1; // wrapped to a new (older) block
      prevM = m;
      const label = `${MONTH_LABELS[m - 1]} ${blockYear}`;
      columns.push({
        col, period_type: "month", period_label: label, year: blockYear, month: m, week_no: null,
        sort_key: blockYear * 100 + m, period_key: `m:${blockYear}-${String(m).padStart(2, "0")}`,
      });
    }
  } else {
    for (const { col, w } of weekCols) {
      columns.push({
        col, period_type: "week", period_label: `${MONTH_LABELS[0]} W${w}`, year: primaryYear,
        month: null, week_no: w, sort_key: primaryYear * 100 + w, period_key: `w:${primaryYear}-${w}`,
      });
    }
  }

  // ── Seed rows per column, then fill matched metric rows ───────────────
  const rowByKey = new Map<string, FinancingReportRow>();
  for (const c of columns) {
    rowByKey.set(c.period_key, {
      period_type: c.period_type, period_key: c.period_key, period_label: c.period_label,
      year: c.year, month: c.month, week_no: c.week_no, sort_key: c.sort_key, ...blankMetrics(),
    });
  }

  let matched = 0;
  for (const row of aoa) {
    const labelCell = row.find((c) => String(c ?? "").trim() !== "");
    const label = normalizeLabel(labelCell);
    if (!label) continue;
    const matcher = MATCHERS.find((mt) => label.includes(mt.needle));
    if (!matcher) continue;
    matched++;
    for (const c of columns) {
      const val = parseCell(row[c.col], matcher.kind);
      (rowByKey.get(c.period_key) as any)[matcher.field] = val;
    }
  }

  // Keep only records that actually carry data (avoid empty future months)
  const rows = Array.from(rowByKey.values())
    .filter((r) => (r.total_attempts ?? 0) > 0 || (r.disbursed_amount ?? 0) > 0 || (r.application_completed ?? 0) > 0)
    .sort((a, b) => a.sort_key - b.sort_key);

  return { rows, matched, format, error: null };
}

// ── Aggregation / helpers ────────────────────────────────────────────────────
export interface Aggregate {
  attempts: number; applications: number; completionPct: number;
  newLoans: number; approved: number; rejected: number; approvalPct: number;
  disbursed: number; netFee: number; commission: number; expectedFee: number;
  businessOwners: number; activationPct: number;
  funnel: { key: string; value: number }[];
}

const n = (v: number | null | undefined) => v ?? 0;

export function aggregateRow(r: FinancingReportRow): Aggregate {
  const attempts = n(r.total_attempts);
  const applications = n(r.application_completed);
  const newLoans = n(r.new_loan);
  const a = n(r.business_owner_a);
  return {
    attempts, applications,
    completionPct: attempts ? (applications / attempts) * 100 : 0,
    newLoans, approved: n(r.contract_approved), rejected: n(r.contract_rejected),
    approvalPct: applications ? (newLoans / applications) * 100 : 0,
    disbursed: n(r.disbursed_amount), netFee: n(r.net_fee), commission: n(r.commission_10),
    expectedFee: n(r.expected_fee), businessOwners: a,
    activationPct: a ? (newLoans / a) * 100 : 0,
    funnel: [
      { key: "Site Visits", value: n(r.total_site_visits) },
      { key: "New Applicant Visits", value: n(r.new_applicant_visits) },
      { key: "Introduction", value: n(r.intro_page) },
      { key: "OTP Verification", value: n(r.otp_verification) },
      { key: "ID Verification", value: n(r.id_verification) },
      { key: "Facial Verification", value: n(r.facial_verification) },
      { key: "Bank Info", value: n(r.bank_info_confirmation) },
      { key: "Agreement Review", value: n(r.loan_agreement_review) },
      { key: "Application Completed", value: applications },
      { key: "New Loan", value: newLoans },
      { key: "Loan Dashboard", value: n(r.loan_dashboard) },
    ].filter((f) => f.value > 0),
  };
}

export type FlagSeverity = "high" | "med" | "info";
export interface DataFlag {
  severity: FlagSeverity;
  title: string;
  detail: string;
}

export function computeFlags(r: FinancingReportRow): DataFlag[] {
  const flags: DataFlag[] = [];
  const fmt = (x: number) => new Intl.NumberFormat("id-ID").format(Math.round(x));

  if (r.avg_disbursed_loan_amount && n(r.new_loan) > 0 && n(r.disbursed_amount) > 0) {
    const expected = n(r.disbursed_amount) / n(r.new_loan);
    if (Math.abs(r.avg_disbursed_loan_amount - expected) / expected > 0.25) {
      flags.push({
        severity: "high",
        title: '"Average Disbursed Loan Amount" does not reconcile',
        detail: `Reported Rp ${fmt(r.avg_disbursed_loan_amount)}, but Disbursed ÷ New Loan ≈ Rp ${fmt(expected)}.`,
      });
    }
  }
  if (n(r.loan_agreement_opened) === 0 && n(r.loan_agreement_review) > 0) {
    flags.push({
      severity: "med",
      title: '"Loan Agreement Opened" is 0 while Review > 0',
      detail: `Review shows ${n(r.loan_agreement_review)} — an agreement cannot be reviewed before it is opened. Likely an untracked event.`,
    });
  }
  if (r.expected_fee && n(r.disbursed_amount) > 0) {
    const rate = (r.expected_fee / n(r.disbursed_amount)) * 100;
    if (rate < 5 || rate > 40) {
      flags.push({
        severity: "info",
        title: "Effective fee rate is outside the usual band",
        detail: `Expected Fee ÷ Disbursed = ${rate.toFixed(1)}% (typically ~20–25%). Worth a sanity check.`,
      });
    }
  }
  return flags;
}

/** August 2026 from the real GoTyme workbook — sample when Supabase is empty. */
export const SAMPLE_REPORTS: FinancingReportRow[] = [
  {
    period_type: "month", period_key: "m:2026-08", period_label: "Aug 2026", year: 2026, month: 8,
    week_no: null, sort_key: 202608,
    days: 31, working_days: 21, offer_unique_merchants: 12346, business_owner_a: 8641,
    total_site_visits: 920, less_active_loan: -405, new_applicant_visits: 515, unique_merchant_ids: 363,
    intro_page: 94, slider_activity: 86, otp_verification: 40, id_verification: 33, facial_verification: 15,
    bank_info_confirmation: 6, loan_agreement_opened: 10, loan_agreement_review: 11, application_completed: 68,
    total_attempts: 363, contract_rejected: 23, contract_approved: 45, new_loan: 45, loan_dashboard: 300,
    new_loan_per_working_day: 2.14, disbursed_amount: 3252000000, avg_disbursed_loan_amount: 72266667,
    expected_fee: 689385000, less_15: 103407750, net_fee: 585977250, commission_10: 58597725,
  },
];
