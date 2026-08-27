"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  User,
  Clock,
  Layers,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface AuditLogRow {
  id: string;
  table_name: string;
  record_id: string | null;
  action: string;
  changed_by: string;
  changed_at: string;
  old_value: any;
  new_value: any;
}

const ACTION_OPTIONS = [
  { value: "CREATE", label: "CREATE (Insert)" },
  { value: "UPDATE", label: "UPDATE (Edit)" },
  { value: "DELETE", label: "DELETE (Remove)" },
  { value: "LOGIN", label: "LOGIN (Auth)" },
];

const MODULE_OPTIONS = [
  { value: "qris_acquisitions", label: "QRIS Acquisition" },
  { value: "online_order_activities", label: "Online Order" },
  { value: "financing_loans", label: "Financing Loan" },
  { value: "network_partner_handovers", label: "Network Partner" },
  { value: "merchant_status_claims", label: "Merchant Status Claim" },
  { value: "requests", label: "Requests" },
  { value: "calendar_events", label: "Calendar" },
  { value: "meeting_minutes", label: "MOM" },
  { value: "profiles", label: "User Profiles" },
];

const SAMPLE_LOGS: AuditLogRow[] = [
  {
    id: "log-1",
    table_name: "profiles",
    record_id: "usr-01",
    action: "LOGIN",
    changed_by: "superadmin@revenuegrowth.com",
    changed_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    old_value: null,
    new_value: { status: "success", ip: "103.28.12.9" },
  },
  {
    id: "log-2",
    table_name: "qris_acquisitions",
    record_id: "qris-88",
    action: "CREATE",
    changed_by: "kenny@perusahaan.com",
    changed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    old_value: null,
    new_value: { merchant_name: "Kopi Kenangan Grand Indonesia", region: "Jakarta Pusat", status: "diajukan" },
  },
  {
    id: "log-3",
    table_name: "financing_loans",
    record_id: "fl-32",
    action: "UPDATE",
    changed_by: "finance.ops@perusahaan.com",
    changed_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    old_value: { status: "diajukan", loan_amount: 150000000 },
    new_value: { status: "disetujui", loan_amount: 150000000, approved_by: "Head of RG" },
  },
  {
    id: "log-4",
    table_name: "merchant_status_claims",
    record_id: "claim-14",
    action: "UPDATE",
    changed_by: "head.rg@perusahaan.com",
    changed_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    old_value: { status: "review" },
    new_value: { status: "disetujui", commission_estimate: 2500000 },
  },
  {
    id: "log-5",
    table_name: "calendar_events",
    record_id: "ev-99",
    action: "CREATE",
    changed_by: "sales.lead@perusahaan.com",
    changed_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    old_value: null,
    new_value: { title: "Online Order Demo — Resto Seafood 99", event_type: "demo" },
  },
];

export default function ActivityLogsPage() {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [inspectRow, setInspectRow] = useState<AuditLogRow | null>(null);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs(SAMPLE_LOGS);
      }
    } catch {
      setLogs(SAMPLE_LOGS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      !search ||
      log.changed_by.toLowerCase().includes(search.toLowerCase()) ||
      log.table_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    const matchModule = !moduleFilter || log.table_name === moduleFilter;
    return matchSearch && matchAction && matchModule;
  });

  const columns: ColumnDef<AuditLogRow>[] = [
    {
      key: "changed_by",
      label: t("logs_col_user"),
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800 text-xs">{r.changed_by}</span>
        </div>
      ),
    },
    {
      key: "action",
      label: t("logs_col_action"),
      render: (r) => {
        const action = r.action.toUpperCase();
        let tone: "success" | "danger" | "warning" | "info" | "neutral" = "neutral";
        if (action.includes("CREATE") || action.includes("INSERT")) tone = "success";
        else if (action.includes("UPDATE") || action.includes("EDIT")) tone = "info";
        else if (action.includes("DELETE") || action.includes("REMOVE")) tone = "danger";
        else if (action.includes("LOGIN") || action.includes("AUTH")) tone = "warning";

        return (
          <Badge tone={tone} showDot>
            {action}
          </Badge>
        );
      },
    },
    {
      key: "table_name",
      label: t("logs_col_module"),
      render: (r) => {
        const mod = MODULE_OPTIONS.find((m) => m.value === r.table_name);
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 text-xs font-mono font-medium text-slate-700 border border-slate-200/80">
            <Layers className="h-3 w-3 text-slate-400" />
            {mod?.label || r.table_name}
          </span>
        );
      },
    },
    {
      key: "changed_at",
      label: t("logs_col_time"),
      render: (r) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {formatDate(r.changed_at, true)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("logs_title")}
        description={t("logs_desc")}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles className="h-3 w-3 text-emerald-600" /> Audit Trail Active
          </span>
        }
        action={
          <Button size="sm" variant="secondary" onClick={fetchLogs} loading={loading}>
            <RefreshCw className="h-4 w-4" /> {language === "id" ? "Muat Ulang" : "Refresh"}
          </Button>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={language === "id" ? "Cari user, aksi, modul..." : "Search user, action, module..."}
        filters={[
          { key: "action", label: t("logs_filter_action"), options: ACTION_OPTIONS },
          { key: "table_name", label: t("logs_filter_module"), options: MODULE_OPTIONS },
        ]}
        filterValues={{ action: actionFilter, table_name: moduleFilter }}
        onFilterChange={(key, val) => {
          if (key === "action") setActionFilter(val);
          if (key === "table_name") setModuleFilter(val);
        }}
      />

      <DataTable
        columns={columns}
        rows={filteredLogs}
        emptyText={loading ? t("loading") : t("logs_empty")}
        actions={(row) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setInspectRow(row)}
            className="text-xs text-accent hover:bg-blue-50"
          >
            <Eye className="h-3.5 w-3.5" /> {language === "id" ? "Detail" : "Inspect"}
          </Button>
        )}
      />

      {/* Inspect JSON Details Modal */}
      {inspectRow && (
        <Dialog
          open={!!inspectRow}
          onClose={() => setInspectRow(null)}
          title={`${inspectRow.action} • ${inspectRow.table_name}`}
          width="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block font-semibold">{t("logs_col_user")}</span>
                <span className="font-semibold text-slate-800">{inspectRow.changed_by}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block font-semibold">{t("logs_col_time")}</span>
                <span className="font-mono text-slate-800">{formatDate(inspectRow.changed_at, true)}</span>
              </div>
            </div>

            {inspectRow.old_value && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {language === "id" ? "Nilai Sebelumnya (Before)" : "Previous Value (Before)"}:
                </span>
                <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 border border-slate-800 scrollbar-thin">
                  {JSON.stringify(inspectRow.old_value, null, 2)}
                </pre>
              </div>
            )}

            {inspectRow.new_value && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {language === "id" ? "Nilai Baru (After / Payload)" : "New Value (After / Payload)"}:
                </span>
                <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-blue-400 border border-slate-800 scrollbar-thin">
                  {JSON.stringify(inspectRow.new_value, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button variant="secondary" onClick={() => setInspectRow(null)}>
                {t("close")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
