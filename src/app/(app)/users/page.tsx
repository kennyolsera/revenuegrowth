"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, ShieldOff, Users, Activity, Eye, User, Clock, Layers } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
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
];

export default function UsersPage() {
  const { t, language } = useLanguage();

  const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "head_rg", label: "Head of Revenue Growth" },
    { value: "team_rg", label: language === "id" ? "Tim Revenue Growth" : "Revenue Growth Team" },
    { value: "external_team", label: language === "id" ? "Tim Eksternal" : "External Team" },
    { value: "finance_ops", label: "Finance / Ops" },
  ];

  const [activeTab, setActiveTab] = useState<"members" | "logs">("members");

  // Members state
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "team_rg", division: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [inspectRow, setInspectRow] = useState<AuditLogRow | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setRows(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    setLogsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("audit_logs").select("*").order("changed_at", { ascending: false }).limit(50);
      if (error || !data || data.length === 0) {
        setLogs(SAMPLE_LOGS);
      } else {
        setLogs(data);
      }
    } catch {
      setLogs(SAMPLE_LOGS);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
    fetchLogs();
  }, []);

  const filteredMembers = rows.filter(
    (r) => !search || r.full_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = logs.filter(
    (l) => !search || l.changed_by.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.table_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengundang pengguna");
      setInviteMsg(language === "id" ? "Undangan berhasil dikirim." : "Invitation sent successfully.");
      setInviteForm({ email: "", full_name: "", role: "team_rg", division: "" });
      fetchRows();
    } catch (err: any) {
      setInviteMsg(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function toggleActive(row: any) {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_active: !row.is_active }).eq("id", row.id);
    fetchRows();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: editing.role, division: editing.division, phone: editing.phone })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      fetchRows();
    } catch (err: any) {
      alert(`${t("save_error")}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const memberColumns: ColumnDef<any>[] = [
    { key: "full_name", label: t("users_col_name") },
    { key: "email", label: t("users_col_email") },
    {
      key: "role",
      label: t("users_col_role"),
      render: (r) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
          {ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role}
        </span>
      ),
    },
    { key: "division", label: t("users_col_division") },
    {
      key: "is_active",
      label: t("users_col_status"),
      render: (r) => (
        <Badge tone={r.is_active ? "success" : "danger"} showDot>
          {r.is_active ? t("users_active") : t("users_inactive")}
        </Badge>
      ),
    },
    { key: "created_at", label: t("users_col_joined"), render: (r) => formatDate(r.created_at) },
  ];

  const logColumns: ColumnDef<AuditLogRow>[] = [
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
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 text-xs font-mono font-medium text-slate-700 border border-slate-200/80">
          <Layers className="h-3 w-3 text-slate-400" />
          {r.table_name}
        </span>
      ),
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
        title={t("users_title")}
        description={t("users_desc")}
        action={
          <Button size="sm" variant="accent" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" /> {t("users_add")}
          </Button>
        }
      />

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all",
            activeTab === "members"
              ? "border-accent text-accent"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Users className="h-4 w-4" />
          {t("users_tab_members")}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {rows.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all",
            activeTab === "logs"
              ? "border-accent text-accent"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Activity className="h-4 w-4" />
          {t("users_tab_logs")}
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-accent font-semibold">
            {logs.length}
          </span>
        </button>
      </div>

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === "members"
            ? language === "id"
              ? "Cari nama / email member..."
              : "Search member name / email..."
            : language === "id"
            ? "Cari riwayat aktivitas user..."
            : "Search user activity logs..."
        }
      />

      {activeTab === "members" ? (
        <DataTable
          columns={memberColumns}
          rows={filteredMembers}
          emptyText={loading ? t("loading") : t("no_data")}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => setEditing(row)}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-accent hover:bg-blue-50 transition-colors"
              >
                {language === "id" ? "Edit Role" : "Edit Role"}
              </button>
              <button
                onClick={() => toggleActive(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                aria-label="Toggle status"
                title={row.is_active ? (language === "id" ? "Nonaktifkan" : "Deactivate") : (language === "id" ? "Aktifkan" : "Activate")}
              >
                {row.is_active ? <ShieldOff className="h-4 w-4 text-slate-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
              </button>
            </div>
          )}
        />
      ) : (
        <DataTable
          columns={logColumns}
          rows={filteredLogs}
          emptyText={logsLoading ? t("loading") : t("logs_empty")}
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
      )}

      {/* Invite Member Modal */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={language === "id" ? "Undang Pengguna Baru" : "Invite New Member"}
        description={
          language === "id"
            ? "Undangan dikirim via email menggunakan Supabase Auth."
            : "Invitation is sent via email using Supabase Auth."
        }
      >
        <form onSubmit={handleInvite}>
          <Field>
            <Label>{t("users_col_email")}</Label>
            <Input type="email" required value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} placeholder="member@perusahaan.com" />
          </Field>
          <Field>
            <Label>{t("users_col_name")}</Label>
            <Input required value={inviteForm.full_name} onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Nama Lengkap" />
          </Field>
          <Field>
            <Label>{t("users_col_role")}</Label>
            <Select value={inviteForm.role} onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{t("users_col_division")}</Label>
            <Input value={inviteForm.division} onChange={(e) => setInviteForm((p) => ({ ...p, division: e.target.value }))} placeholder="mis. Revenue Growth / Sales" />
          </Field>

          {/* Info notice about email invite + no default password */}
          <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 leading-relaxed">
            <span className="font-bold">
              {language === "id" ? "ℹ️ Cara Kerja:" : "ℹ️ How it works:"}
            </span>{" "}
            {language === "id"
              ? "Pengguna akan menerima email undangan dari Supabase. Mereka perlu klik link di email untuk mengatur password sendiri. Tidak ada password default. Minta pengguna untuk cek inbox (dan folder spam) setelah diundang."
              : "The invited user will receive an email from Supabase with a setup link. They click the link to set their own password. There is no default password — ask the new member to check their inbox (and spam folder) after being invited."}
          </div>

          {inviteMsg && (

            <p className="mb-3 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700">{inviteMsg}</p>
          )}

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              {t("close")}
            </Button>
            <Button type="submit" variant="accent" loading={inviting}>
              {language === "id" ? "Kirim Undangan" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Role Modal */}
      {editing && (
        <Dialog
          open={!!editing}
          onClose={() => setEditing(null)}
          title={`Edit Role — ${editing.full_name}`}
        >
          <form onSubmit={saveEdit}>
            <Field>
              <Label>{t("users_col_role")}</Label>
              <Select value={editing.role} onChange={(e) => setEditing((p: any) => ({ ...p, role: e.target.value }))}>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>{t("users_col_division")}</Label>
              <Input value={editing.division ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, division: e.target.value }))} />
            </Field>
            <Field>
              <Label>{language === "id" ? "Nomor Telepon" : "Phone Number"}</Label>
              <Input value={editing.phone ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, phone: e.target.value }))} />
            </Field>
            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                {t("cancel")}
              </Button>
              <Button type="submit" variant="accent" loading={saving}>
                {t("save")}
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Inspect Log Details Modal */}
      {inspectRow && (
        <Dialog
          open={!!inspectRow}
          onClose={() => setInspectRow(null)}
          title={`${inspectRow.action} • ${inspectRow.table_name}`}
          width="max-w-xl"
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
                <pre className="max-h-36 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 border border-slate-800 scrollbar-thin">
                  {JSON.stringify(inspectRow.old_value, null, 2)}
                </pre>
              </div>
            )}

            {inspectRow.new_value && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {language === "id" ? "Nilai Baru (After / Payload)" : "New Value (After / Payload)"}:
                </span>
                <pre className="max-h-36 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-blue-400 border border-slate-800 scrollbar-thin">
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
