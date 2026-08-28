"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Landmark, Wallet, Percent, TrendingDown, FileUp, ShieldAlert, Lock, AlertTriangle, Info } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/Button";
import { WeeklyReportImportDialog } from "@/components/financing/WeeklyReportImportDialog";
import { formatRupiah, cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  aggregate,
  computeFlags,
  SAMPLE_WEEKLY,
  type WeeklyReportRow,
  type DataFlag,
} from "@/lib/financingWeekly";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** Compact Rupiah for chart axes / big KPIs — e.g. "Rp 2,6 M", "Rp 453 jt". */
function shortRupiah(n: number): string {
  if (Math.abs(n) >= 1e9) return `Rp ${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (Math.abs(n) >= 1e6) return `Rp ${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 0 })} jt`;
  return formatRupiah(n);
}

const FLAG_STYLE: Record<DataFlag["severity"], { chip: string; icon: React.ReactNode; label: string }> = {
  high: { chip: "bg-rose-50 text-rose-700 border-rose-200", icon: <AlertTriangle className="h-4 w-4" />, label: "High" },
  med: { chip: "bg-amber-50 text-amber-700 border-amber-200", icon: <ShieldAlert className="h-4 w-4" />, label: "Med" },
  info: { chip: "bg-accent-soft text-accent border-accent/20", icon: <Info className="h-4 w-4" />, label: "Info" },
};

export default function FinancingPerformancePage() {
  const { t, language } = useLanguage();
  const [rows, setRows] = useState<WeeklyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!isSupabaseConfigured) {
        setAllowed(true);
        setCanManage(true);
        setRows(SAMPLE_WEEKLY);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user?.id ?? "")
        .single();
      const role = profile?.role;
      const isAllowed = role === "super_admin" || role === "head_rg";
      setAllowed(isAllowed);
      setCanManage(isAllowed);
      if (!isAllowed) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("financing_weekly_reports")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .order("week_no", { ascending: true });

      const all = (data as WeeklyReportRow[]) ?? [];
      if (all.length === 0) {
        setRows([]);
      } else {
        // Show the most recent period only
        const latest = all[0];
        setRows(all.filter((r) => r.year === latest.year && r.month === latest.month));
      }
      setLoading(false);
    }
    load();
  }, [reload]);

  const agg = useMemo(() => aggregate(rows), [rows]);
  const flags = useMemo(() => computeFlags(rows), [rows]);
  const period = rows[0] ? `${MONTH_LABELS[rows[0].month - 1]} ${rows[0].year}` : "";
  const less15 = agg.expectedFee - agg.netFee;

  const chartData = rows.map((r) => ({
    week: `W${r.week_no}`,
    disbursed: r.disbursed_amount,
    completion: r.total_attempts ? Number(((r.application_completed / r.total_attempts) * 100).toFixed(2)) : 0,
  }));

  const funnelMax = Math.max(1, ...agg.funnel.map((f) => f.value));

  // ── Access states ──────────────────────────────────────────────────────
  if (allowed === false) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("finperf_title")} description={t("finperf_desc")} />
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Lock className="h-6 w-6" />
            </div>
            <p className="max-w-sm text-sm font-medium text-slate-600">{t("finperf_restricted")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("finperf_title")}
        description={t("finperf_desc")}
        badge={
          period ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
              {period}
            </span>
          ) : undefined
        }
        action={
          canManage ? (
            <Button variant="accent" size="sm" onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4" /> {t("finperf_import")}
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState text={t("loading")} />
          </CardBody>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState text={t("finperf_no_data")} />
          </CardBody>
        </Card>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t("finperf_kpi_disbursed")} value={shortRupiah(agg.disbursed)} icon={Landmark} color="indigo"
              trend={rows.length >= 2 ? `${(((rows[rows.length - 1].disbursed_amount - rows[0].disbursed_amount) / (rows[0].disbursed_amount || 1)) * 100).toFixed(0)}% W1→W${rows.length}` : undefined}
              trendTone="danger" />
            <KpiCard label={t("finperf_kpi_netfee")} value={shortRupiah(agg.netFee)} icon={Wallet} color="emerald" />
            <KpiCard label={t("finperf_kpi_commission")} value={shortRupiah(agg.commission)} icon={Percent} color="blue" />
            <KpiCard label={t("finperf_kpi_approval")} value={`${agg.approvalPct.toFixed(1)}%`} icon={TrendingDown} color="amber"
              trend={`${agg.newLoans}/${agg.applications}`} trendTone="neutral" />
          </div>

          {/* Trends */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title={t("finperf_disbursed_title")} icon={Landmark} />
              <CardBody>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={44}
                      tickFormatter={(v) => `${(v / 1e6).toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                      formatter={(v: any) => [formatRupiah(v), t("fl_col_amount")]}
                    />
                    <Bar dataKey="disbursed" radius={[6, 6, 0, 0]} fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={t("finperf_completion_title")} icon={Percent} />
              <CardBody>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={40}
                      tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "B/C"]} />
                    <Line type="monotone" dataKey="completion" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Funnel + Fee economics */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title={t("finperf_funnel_title")} description={t("finperf_funnel_note")} />
              <CardBody className="space-y-2.5">
                {agg.funnel.map((f) => (
                  <div key={f.key} className="grid grid-cols-[150px_1fr_36px] items-center gap-3">
                    <span className="truncate text-xs text-slate-500" title={f.key}>{f.key}</span>
                    <div className="h-5 overflow-hidden rounded-md bg-accent/10">
                      <div className="h-full rounded-md bg-gradient-to-r from-accent to-accent-violet"
                        style={{ width: `${(f.value / funnelMax) * 100}%` }} />
                    </div>
                    <span className={cn("text-right text-xs font-semibold", f.value === 0 && "text-amber-600")}>
                      {f.value}{f.value === 0 ? " ⚠" : ""}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={t("finperf_fee_title")} icon={Wallet} />
              <CardBody className="space-y-3">
                <FeeRow label={t("finperf_expected_fee")} value={agg.expectedFee} pct={100} tone="pos" />
                <FeeRow label={t("finperf_less15")} value={-less15} pct={(less15 / (agg.expectedFee || 1)) * 100} tone="cut" />
                <FeeRow label={t("finperf_net_fee")} value={agg.netFee} pct={(agg.netFee / (agg.expectedFee || 1)) * 100} tone="net" />
                <FeeRow label={t("finperf_commission")} value={agg.commission} pct={(agg.commission / (agg.expectedFee || 1)) * 100} tone="take" />
              </CardBody>
            </Card>
          </div>

          {/* Data-quality flags */}
          {flags.length > 0 && (
            <Card>
              <CardHeader title={t("finperf_flags_title")} icon={ShieldAlert} />
              <CardBody className="space-y-3">
                {flags.map((f, i) => {
                  const s = FLAG_STYLE[f.severity];
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase", s.chip)}>
                        {s.icon} {s.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{f.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}

          {/* Weekly table */}
          <Card>
            <CardHeader title={t("finperf_table_title")} />
            <CardBody className="p-0">
              <div className="scrollbar-thin overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3 font-bold">Metric</th>
                      {rows.map((r) => (
                        <th key={r.week_no} className="px-4 py-3 text-right font-bold">W{r.week_no}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    <TableRow label={language === "id" ? "Percobaan unik (C)" : "Unique attempts (C)"} cells={rows.map((r) => String(r.total_attempts))} />
                    <TableRow label={language === "id" ? "Aplikasi selesai (B)" : "Applications (B)"} cells={rows.map((r) => String(r.application_completed))} />
                    <TableRow label="% (B/C)" cells={rows.map((r) => r.total_attempts ? `${((r.application_completed / r.total_attempts) * 100).toFixed(1)}%` : "-")} />
                    <TableRow label={language === "id" ? "Pinjaman baru (D)" : "New loans (D)"} cells={rows.map((r) => String(r.new_loan))} />
                    <TableRow label={language === "id" ? "Pencairan" : "Disbursed"} cells={rows.map((r) => formatRupiah(r.disbursed_amount))} />
                    <TableRow label="Net Fee" cells={rows.map((r) => formatRupiah(r.net_fee ?? 0))} />
                    <TableRow label={language === "id" ? "Komisi 10%" : "Commission 10%"} cells={rows.map((r) => formatRupiah(r.commission_10 ?? 0))} highlight />
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      <WeeklyReportImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={() => setReload((n) => n + 1)} />
    </div>
  );
}

function FeeRow({ label, value, pct, tone }: { label: string; value: number; pct: number; tone: "pos" | "cut" | "net" | "take" }) {
  const bar: Record<string, string> = {
    pos: "bg-gradient-to-r from-accent to-accent-violet",
    cut: "bg-rose-400",
    net: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    take: "bg-gradient-to-r from-accent-violet to-accent",
  };
  return (
    <div className="grid grid-cols-[150px_1fr_130px] items-center gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="h-6 overflow-hidden rounded-md bg-slate-100">
        <div className={cn("h-full rounded-md", bar[tone])} style={{ width: `${Math.min(100, Math.abs(pct))}%` }} />
      </div>
      <span className={cn("text-right text-xs font-semibold font-mono", value < 0 ? "text-rose-600" : "text-slate-700")}>
        {value < 0 ? "– " : ""}{formatRupiah(Math.abs(value))}
      </span>
    </div>
  );
}

function TableRow({ label, cells, highlight }: { label: string; cells: string[]; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-accent/[0.05]" : undefined}>
      <td className={cn("px-4 py-2.5 font-sans font-semibold text-slate-500", highlight && "text-slate-800")}>{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-2.5 text-right">{c}</td>
      ))}
    </tr>
  );
}
