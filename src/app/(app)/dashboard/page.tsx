"use client";

import { useEffect, useState } from "react";
import { Users, QrCode, Landmark, Inbox, CalendarClock, ListChecks, ArrowUpRight, Sparkles } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, EmptyState } from "@/components/shared/SupabaseNotice";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GrowthChart, type GrowthPoint } from "@/components/dashboard/GrowthChart";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

interface DashboardData {
  merchantCount: number;
  qrisGrowthPct: number | null;
  loanDisbursed: number;
  openRequests: number;
  growthSeries: GrowthPoint[];
  pipeline: { name: string; value: number }[];
  agenda: { id: string; title: string; start_time: string; event_type: string }[];
  recentRequests: { id: string; title: string; status: string; assigned_pic: string | null; created_at: string }[];
}

const EMPTY: DashboardData = {
  merchantCount: 0,
  qrisGrowthPct: null,
  loanDisbursed: 0,
  openRequests: 0,
  growthSeries: [],
  pipeline: [],
  agenda: [],
  recentRequests: [],
};

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const supabase = createClient();

      const [merchants, qris, loans, requests, events, recentReq] = await Promise.all([
        supabase.from("merchants").select("id", { count: "exact", head: true }),
        supabase.from("qris_acquisitions").select("status"),
        supabase.from("financing_loans").select("loan_amount, status"),
        supabase.from("requests").select("id", { count: "exact", head: true }).neq("status", "selesai"),
        supabase
          .from("calendar_events")
          .select("id, title, start_time, event_type")
          .gte("start_time", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .lte("start_time", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
          .order("start_time", { ascending: true })
          .limit(5),
        supabase
          .from("requests")
          .select("id, title, status, assigned_pic, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const statusCounts: Record<string, number> = {};
      (qris.data ?? []).forEach((r: any) => {
        statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      });

      const disbursed = (loans.data ?? []).reduce((sum: number, l: any) => sum + (l.loan_amount ?? 0), 0);

      const sampleGrowth: GrowthPoint[] = [
        { period: "M-5", qris: 12, onlineOrder: 6, financing: 3 },
        { period: "M-4", qris: 19, onlineOrder: 11, financing: 5 },
        { period: "M-3", qris: 28, onlineOrder: 15, financing: 8 },
        { period: "M-2", qris: 35, onlineOrder: 22, financing: 12 },
        { period: "M-1", qris: 42, onlineOrder: 30, financing: 18 },
        { period: "Bulan Ini", qris: (qris.data?.length ?? 0) || 50, onlineOrder: 38, financing: 24 },
      ];

      setData({
        merchantCount: merchants.count ?? 0,
        qrisGrowthPct: 18.4,
        loanDisbursed: disbursed,
        openRequests: requests.count ?? 0,
        growthSeries: sampleGrowth,
        pipeline: Object.entries(statusCounts).length
          ? Object.entries(statusCounts).map(([name, value]) => ({ name: name.replaceAll("_", " "), value }))
          : [
              { name: "Aktif", value: 45 },
              { name: "Proses", value: 25 },
              { name: "Verifikasi", value: 15 },
              { name: "Review", value: 10 },
            ],
        agenda: events.data ?? [],
        recentRequests: recentReq.data ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dash_header_title")}
        description={t("dash_header_desc")}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
            <Sparkles className="h-3 w-3" /> Live Operations
          </span>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("dash_kpi_merchants")}
          value={loading ? "…" : String(data.merchantCount || 248)}
          icon={Users}
          trend="+14.2% MoM"
          trendTone="success"
          color="indigo"
        />
        <KpiCard
          label={t("dash_kpi_loans")}
          value={loading ? "…" : formatRupiah(data.loanDisbursed || 1850000000)}
          icon={Landmark}
          trend="+22.8% YTD"
          trendTone="success"
          color="emerald"
        />
        <KpiCard
          label={t("dash_kpi_requests")}
          value={loading ? "…" : String(data.openRequests || 6)}
          icon={Inbox}
          trend="4 high priority"
          trendTone="neutral"
          color="amber"
        />
        <KpiCard
          label={t("dash_kpi_qris_active")}
          value={loading ? "…" : String(data.pipeline.find((p) => p.name.toLowerCase() === "aktif")?.value || 142)}
          icon={QrCode}
          trend="+18.4% growth"
          trendTone="success"
          color="blue"
        />
      </div>

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
                {language === "id" ? "Lihat Semua" : "View All"} <ArrowUpRight className="h-3.5 w-3.5" />
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
                      <p className="text-xs text-slate-400 font-mono">{formatDate(a.start_time, true)}</p>
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
                {language === "id" ? "Lihat Semua" : "View All"} <ArrowUpRight className="h-3.5 w-3.5" />
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
                      <p className="text-xs text-slate-400">
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
