"use client";

import { useEffect, useState } from "react";
import { Users, QrCode, Landmark, Inbox, CalendarClock, ListChecks, ArrowUpRight, Sparkles } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, EmptyState } from "@/components/shared/SupabaseNotice";
import { KpiCard, KpiStrip } from "@/components/dashboard/KpiCard";
import { GrowthChart, type GrowthPoint } from "@/components/dashboard/GrowthChart";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

interface DashboardData {
  merchantCount: number;
  loanDisbursed: number;
  openRequests: number;
  qrisActive: number;
  growthSeries: GrowthPoint[];
  pipeline: { name: string; value: number }[];
  agenda: { id: string; title: string; start_time: string; event_type: string }[];
  recentRequests: { id: string; title: string; status: string; assigned_pic: string | null; created_at: string }[];
}

const EMPTY: DashboardData = {
  merchantCount: 0,
  loanDisbursed: 0,
  openRequests: 0,
  qrisActive: 0,
  growthSeries: [],
  pipeline: [],
  agenda: [],
  recentRequests: [],
};

/** Returns today's start and end in local time converted to ISO */
function todayBoundaryISO(): { start: string; end: string } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
}

/**
 * Build a real 6-month acquisition series by bucketing created_at timestamps
 * per feature. No fabricated numbers — empty months legitimately show 0.
 */
function buildGrowthSeries(
  qris: string[],
  online: string[],
  financing: string[],
  language: string
): GrowthPoint[] {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", { month: "short" });
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), period: fmt.format(d), qris: 0, onlineOrder: 0, financing: 0 };
  });
  const tally = (rows: string[], key: "qris" | "onlineOrder" | "financing") => {
    for (const ts of rows) {
      const d = ts ? new Date(ts) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const b = buckets.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
      if (b) b[key] += 1;
    }
  };
  tally(qris, "qris");
  tally(online, "onlineOrder");
  tally(financing, "financing");
  return buckets.map(({ period, qris, onlineOrder, financing }) => ({ period, qris, onlineOrder, financing }));
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        // Use realistic sample data for demo when Supabase not configured
        setData({
          merchantCount: 248,
          loanDisbursed: 1850000000,
          openRequests: 6,
          qrisActive: 142,
          growthSeries: [
            { period: "M-5", qris: 12, onlineOrder: 6, financing: 3 },
            { period: "M-4", qris: 19, onlineOrder: 11, financing: 5 },
            { period: "M-3", qris: 28, onlineOrder: 15, financing: 8 },
            { period: "M-2", qris: 35, onlineOrder: 22, financing: 12 },
            { period: "M-1", qris: 42, onlineOrder: 30, financing: 18 },
            { period: "This Month", qris: 50, onlineOrder: 38, financing: 24 },
          ],
          pipeline: [
            { name: "Active", value: 45 },
            { name: "Processing", value: 25 },
            { name: "Verification", value: 15 },
            { name: "Review", value: 10 },
          ],
          agenda: [],
          recentRequests: [],
        });
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { start, end } = todayBoundaryISO();

      const [merchants, qrisList, loans, requests, events, recentReq, qrisDates, ooDates, finDates] =
        await Promise.all([
          supabase.from("merchants").select("id", { count: "exact", head: true }),
          supabase.from("qris_acquisitions").select("status"),
          // Only sum loans that are actually disbursed or fully paid off
          supabase.from("financing_loans").select("loan_amount, status").in("status", ["dicairkan", "lunas"]),
          supabase.from("requests").select("id", { count: "exact", head: true }).neq("status", "selesai"),
          supabase
            .from("calendar_events")
            .select("id, title, start_time, event_type")
            .gte("start_time", start)
            .lte("start_time", end)
            .order("start_time", { ascending: true })
            .limit(5),
          supabase
            .from("requests")
            .select("id, title, status, assigned_pic, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          // created_at streams used to build a real acquisition trend
          supabase.from("qris_acquisitions").select("created_at"),
          supabase.from("online_order_activities").select("created_at"),
          supabase.from("financing_loans").select("created_at"),
        ]);

      const statusCounts: Record<string, number> = {};
      (qrisList.data ?? []).forEach((r: any) => {
        statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      });

      const qrisActive = statusCounts["aktif"] ?? 0;
      const disbursed = (loans.data ?? []).reduce(
        (sum: number, l: any) => sum + (l.loan_amount ?? 0),
        0
      );

      const growthSeries = buildGrowthSeries(
        (qrisDates.data ?? []).map((r: any) => r.created_at),
        (ooDates.data ?? []).map((r: any) => r.created_at),
        (finDates.data ?? []).map((r: any) => r.created_at),
        language
      );

      setData({
        merchantCount: merchants.count ?? 0,
        loanDisbursed: disbursed,
        openRequests: requests.count ?? 0,
        qrisActive,
        growthSeries,
        pipeline: Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replaceAll("_", " "),
          value,
        })),
        agenda: events.data ?? [],
        recentRequests: recentReq.data ?? [],
      });
      setLoading(false);
    }
    load();
  }, [language]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dash_header_title")}
        description={t("dash_header_desc")}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
            <Sparkles className="h-3 w-3" /> {isSupabaseConfigured ? t("live_operations") : t("sample_data")}
          </span>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}

      {/* KPI readout strip */}
      <KpiStrip>
        <KpiCard
          label={t("dash_kpi_merchants")}
          value={String(data.merchantCount)}
          loading={loading}
          icon={Users}
          trend={isSupabaseConfigured ? undefined : "+14.2% MoM"}
          trendTone="success"
          color="indigo"
        />
        <KpiCard
          label={t("dash_kpi_loans")}
          value={formatRupiah(data.loanDisbursed)}
          loading={loading}
          icon={Landmark}
          trend={isSupabaseConfigured ? undefined : "+22.8% YTD"}
          trendTone="success"
          color="emerald"
        />
        <KpiCard
          label={t("dash_kpi_requests")}
          value={String(data.openRequests)}
          loading={loading}
          icon={Inbox}
          color="amber"
        />
        <KpiCard
          label={t("dash_kpi_qris_active")}
          value={String(data.qrisActive)}
          loading={loading}
          icon={QrCode}
          trend={isSupabaseConfigured ? undefined : "+18.4% growth"}
          trendTone="success"
          color="blue"
        />
      </KpiStrip>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GrowthChart data={data.growthSeries} />
        <PipelineChart data={data.pipeline} />
      </div>

      {/* Bottom Info Grid: Today's Agenda & Recent Requests */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Agenda Card */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title={t("dash_agenda_title")}
            description={t("dash_agenda_desc")}
            icon={CalendarClock}
            action={
              <Link
                href="/calendar"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                {t("view_all")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0 flex-1">
            {data.agenda.length === 0 ? (
              <div className="p-6">
                <EmptyState text={t("dash_empty_agenda")} />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.agenda.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-accent">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-500 font-mono">{formatDate(a.start_time, true)}</p>
                    </div>
                    <StatusBadge status={a.event_type} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Recent Requests Card */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader
            title={t("dash_recent_req_title")}
            description={t("dash_recent_req_desc")}
            icon={ListChecks}
            action={
              <Link
                href="/requests"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                {t("view_all")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0 flex-1">
            {data.recentRequests.length === 0 ? (
              <div className="p-6">
                <EmptyState text={t("dash_empty_requests")} />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentRequests.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <ListChecks className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-500">
                        PIC: {r.assigned_pic ?? t("dash_unassigned")} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
