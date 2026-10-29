"use client";

import { useEffect, useState } from "react";
import { Plus, Key, Copy, Check, PencilSimple, Trash, ShieldCheck, ShieldSlash as ShieldOff, Users, Pulse as Activity, Eye, User, Clock, Stack as Layers } from "@/components/icons";
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
import { useToast } from "@/lib/ToastContext";
import { PasswordField } from "@/components/users/PasswordField";
import { recordName, savedMsg } from "@/lib/toast-copy";

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
  const toast = useToast();

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
  const EMPTY_INVITE = { email: "", full_name: "", role: "team_rg", division: "", mode: "password" as "password" | "invite", password: "" };
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  // Shown once after "Set password" creation so the admin can pass the login on.
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [credsCopied, setCredsCopied] = useState(false);

  const [pwTarget, setPwTarget] = useState<any | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<any | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
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
    createClient()
      .auth.getUser()
      .then(({ data }) => setMyId(data.user?.id ?? null))
      .catch(() => {});
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
      if (!res.ok) throw new Error(json.error ?? (language === "id" ? "Gagal menambah pengguna" : "Couldn't add the user"));
      if (inviteForm.mode === "password") {
        setCreatedCreds({ email: inviteForm.email.trim().toLowerCase(), password: inviteForm.password });
        toast.success(language === "id" ? "Pengguna dibuat, bisa langsung login." : "User created and can sign in now.");
      } else {
        const okMsg = language === "id" ? "Undangan berhasil dikirim." : "Invitation sent.";
        setInviteMsg(okMsg);
        toast.success(okMsg);
      }
      setInviteForm(EMPTY_INVITE);
      fetchRows();
    } catch (err: any) {
      setInviteMsg(err.message);
    } finally {
      setInviting(false);
    }
  }

  function closeInvite() {
    setInviteOpen(false);
    setCreatedCreds(null);
    setCredsCopied(false);
    setInviteMsg(null);
    setInviteForm(EMPTY_INVITE);
  }

  async function copyCreds() {
    if (!createdCreds) return;
    const text =
      language === "id"
        ? `Login ESMM Dashboard\n${window.location.origin}/login\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}`
        : `ESMM Dashboard login\n${window.location.origin}/login\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCredsCopied(true);
    } catch {
      /* clipboard blocked: details stay visible to copy by hand */
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwTarget) return;
    setPwSaving(true);
    setPwError(null);
    try {
      const res = await fetch("/api/set-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: pwTarget.id, password: pwValue }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      toast.success(
        language === "id" ? `Password ${pwTarget.full_name ?? pwTarget.email} diperbarui.` : `Password updated for ${pwTarget.full_name ?? pwTarget.email}.`
      );
      setPwTarget(null);
      setPwValue("");
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  async function toggleActive(row: any) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) {
      toast.error(`${t("save_error")}: ${error.message}`);
      return;
    }
    toast.success(
      language === "id"
        ? `${row.full_name || row.email} ${row.is_active ? "dinonaktifkan" : "diaktifkan"}`
        : `${row.full_name || row.email} ${row.is_active ? "deactivated" : "activated"}`
    );
    fetchRows();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    try {
      // Server route keeps the login email and the profile in sync, and applies role rules.
      const res = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editing.id,
          full_name: editing.full_name ?? "",
          email: editing.email ?? "",
          role: editing.role,
          division: editing.division ?? "",
          phone: editing.phone ?? "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setEditing(null);
      toast.success(savedMsg(language, "updated", recordName(editing)));
      fetchRows();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: deleting.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      toast.success(language === "id" ? `${deleting.full_name || deleting.email} dihapus.` : `${deleting.full_name || deleting.email} deleted.`);
      setDeleting(null);
      fetchRows();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleteBusy(false);
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
                onClick={() => {
                  setEditing(row);
                  setEditError(null);
                }}
                className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
                aria-label={`${language === "id" ? "Ubah" : "Edit"}: ${row.full_name || row.email}`}
                title={language === "id" ? "Ubah pengguna" : "Edit user"}
              >
                <PencilSimple className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setPwTarget(row);
                  setPwValue("");
                  setPwError(null);
                }}
                className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
                aria-label={`${language === "id" ? "Atur password" : "Set password"}: ${row.full_name ?? row.email}`}
                title={language === "id" ? "Atur password" : "Set password"}
              >
                <Key className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleActive(row)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                aria-label="Toggle status"
                title={row.is_active ? (language === "id" ? "Nonaktifkan" : "Deactivate") : (language === "id" ? "Aktifkan" : "Activate")}
              >
                {row.is_active ? <ShieldOff className="h-4 w-4 text-slate-400" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
              </button>
              <button
                onClick={() => {
                  setDeleting(row);
                  setDeleteConfirm("");
                  setDeleteError(null);
                }}
                disabled={row.id === myId}
                className="rounded-lg p-1.5 text-text-3 hover:bg-red-50 hover:text-red transition-colors disabled:pointer-events-none disabled:opacity-30"
                aria-label={`${language === "id" ? "Hapus" : "Delete"}: ${row.full_name || row.email}`}
                title={row.id === myId ? (language === "id" ? "Tidak bisa menghapus akun sendiri" : "You can't delete your own account") : language === "id" ? "Hapus pengguna" : "Delete user"}
              >
                <Trash className="h-4 w-4" />
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

      {/* Add Member Modal */}
      <Dialog
        open={inviteOpen}
        onClose={closeInvite}
        title={language === "id" ? "Tambah pengguna" : "Add member"}
        description={
          createdCreds
            ? undefined
            : language === "id"
            ? "Atur password langsung, atau kirim undangan lewat email."
            : "Set a password now, or send an email invitation."
        }
      >
        {createdCreds ? (
          <div>
            <p className="mb-3 text-[13px] text-text-2">
              {language === "id"
                ? "Akun sudah aktif. Kirim detail login ini ke pengguna lewat jalur pribadi (mis. WhatsApp). Password tidak akan ditampilkan lagi setelah jendela ini ditutup."
                : "The account is active. Send these login details to the person privately (e.g. WhatsApp). The password won't be shown again after you close this."}
            </p>
            <dl className="mb-4 space-y-1.5 rounded-lg border border-border bg-surface-2 p-3 font-mono text-[12.5px]">
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-text-3">URL</dt><dd className="break-all text-text">{typeof window !== "undefined" ? `${window.location.origin}/login` : "/login"}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-text-3">Email</dt><dd className="break-all text-text">{createdCreds.email}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-text-3">Password</dt><dd className="break-all text-text">{createdCreds.password}</dd></div>
            </dl>
            <div className="flex justify-end gap-2.5 border-t border-divider pt-4">
              <Button type="button" variant="secondary" onClick={copyCreds}>
                {credsCopied ? <Check className="h-4 w-4 text-green" /> : <Copy className="h-4 w-4" />}
                {credsCopied ? (language === "id" ? "Tersalin" : "Copied") : language === "id" ? "Salin detail login" : "Copy login details"}
              </Button>
              <Button type="button" variant="accent" onClick={closeInvite}>
                {language === "id" ? "Selesai" : "Done"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite} noValidate={false}>
            <div role="radiogroup" aria-label={language === "id" ? "Cara menambah" : "How to add"} className="mb-4 inline-flex rounded-md bg-surface-3 p-0.5">
              {([
                { v: "password", l: language === "id" ? "Atur password" : "Set password" },
                { v: "invite", l: language === "id" ? "Kirim undangan email" : "Send email invite" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={inviteForm.mode === o.v}
                  onClick={() => setInviteForm((p) => ({ ...p, mode: o.v }))}
                  className={cn(
                    "h-7 rounded-[5px] px-3 text-[12.5px] font-medium transition-colors",
                    inviteForm.mode === o.v ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <Field>
              <Label htmlFor="inv-email">{t("users_col_email")}</Label>
              <Input id="inv-email" type="email" autoComplete="off" required value={inviteForm.email} onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))} placeholder="member@perusahaan.com" />
            </Field>
            <Field>
              <Label htmlFor="inv-name">{t("users_col_name")}</Label>
              <Input id="inv-name" required value={inviteForm.full_name} onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))} placeholder={language === "id" ? "Nama lengkap" : "Full name"} />
            </Field>
            {inviteForm.mode === "password" && (
              <PasswordField
                id="inv-password"
                label="Password"
                value={inviteForm.password}
                onChange={(v) => setInviteForm((p) => ({ ...p, password: v }))}
                language={language}
              />
            )}
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="inv-role">{t("users_col_role")}</Label>
                <Select id="inv-role" value={inviteForm.role} onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="inv-division">{t("users_col_division")}</Label>
                <Input id="inv-division" value={inviteForm.division} onChange={(e) => setInviteForm((p) => ({ ...p, division: e.target.value }))} placeholder="Revenue Growth" />
              </Field>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-text-3">
              {inviteForm.mode === "password"
                ? language === "id"
                  ? "Akun langsung aktif tanpa email. Setelah disimpan, detail login ditampilkan sekali untuk Anda kirim ke pengguna."
                  : "The account is active straight away, no email needed. After saving, the login details are shown once for you to pass on."
                : language === "id"
                ? "Supabase mengirim email berisi link untuk mengatur password. Link hanya berfungsi jika Site URL di Supabase sudah diarahkan ke domain dashboard."
                : "Supabase emails a link to set a password. The link only works once the Supabase Site URL points to the dashboard's domain."}
            </p>

            {inviteMsg && (
              <p role="alert" className="mb-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-text-2">
                {inviteMsg}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2.5 border-t border-divider pt-4">
              <Button type="button" variant="secondary" onClick={closeInvite}>
                {t("close")}
              </Button>
              <Button
                type="submit"
                variant="accent"
                loading={inviting}
                disabled={inviteForm.mode === "password" && inviteForm.password.length < 8}
              >
                {inviteForm.mode === "password"
                  ? language === "id" ? "Buat pengguna" : "Create user"
                  : language === "id" ? "Kirim undangan" : "Send invitation"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Set Password Modal */}
      <Dialog
        open={!!pwTarget}
        onClose={() => setPwTarget(null)}
        title={language === "id" ? "Atur password" : "Set password"}
        description={pwTarget ? `${pwTarget.full_name ?? ""} (${pwTarget.email})` : undefined}
      >
        <form onSubmit={handleSetPassword}>
          <PasswordField id="set-password" label={language === "id" ? "Password baru" : "New password"} value={pwValue} onChange={setPwValue} language={language} />
          <p className="mb-3 text-xs leading-relaxed text-text-3">
            {language === "id"
              ? "Password lama langsung tidak berlaku. Kirim password baru ke pengguna lewat jalur pribadi."
              : "The old password stops working immediately. Send the new one to the person privately."}
          </p>
          {pwError && (
            <p role="alert" className="mb-3 text-xs text-red">
              {pwError}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2.5 border-t border-divider pt-4">
            <Button type="button" variant="secondary" onClick={() => setPwTarget(null)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={pwSaving} disabled={pwValue.length < 8}>
              {language === "id" ? "Simpan password" : "Save password"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit User Modal */}
      {editing && (
        <Dialog
          open={!!editing}
          onClose={() => setEditing(null)}
          title={language === "id" ? "Ubah pengguna" : "Edit user"}
          description={rows.find((r) => r.id === editing.id)?.email ?? editing.email}
        >
          <form onSubmit={saveEdit}>
            <Field>
              <Label htmlFor="edit-name">{t("users_col_name")}</Label>
              <Input id="edit-name" required value={editing.full_name ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, full_name: e.target.value }))} />
            </Field>
            <Field>
              <Label htmlFor="edit-email">{t("users_col_email")}</Label>
              <Input id="edit-email" type="email" required value={editing.email ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, email: e.target.value }))} />
              <p className="mt-1 text-xs text-text-3">
                {language === "id" ? "Mengubah email juga mengubah email untuk login." : "Changing the email also changes the email they sign in with."}
              </p>
            </Field>
            <Field>
              <Label htmlFor="edit-role">{t("users_col_role")}</Label>
              <Select id="edit-role" value={editing.role} disabled={editing.id === myId} onChange={(e) => setEditing((p: any) => ({ ...p, role: e.target.value }))}>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="edit-division">{t("users_col_division")}</Label>
                <Input id="edit-division" value={editing.division ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, division: e.target.value }))} />
              </Field>
              <Field>
                <Label htmlFor="edit-phone">{language === "id" ? "Nomor telepon" : "Phone number"}</Label>
                <Input id="edit-phone" inputMode="tel" value={editing.phone ?? ""} onChange={(e) => setEditing((p: any) => ({ ...p, phone: e.target.value }))} />
              </Field>
            </div>
            {editing.id === myId && (
              <p className="mb-3 text-xs text-text-3">
                {language === "id" ? "Anda tidak bisa mengubah role sendiri." : "You can't change your own role."}
              </p>
            )}
            {editError && (
              <p role="alert" className="mb-3 text-xs text-red">
                {editError}
              </p>
            )}
            <div className="flex justify-end gap-2.5 border-t border-divider pt-4 mt-2">
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

      {/* Delete User Modal */}
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={language === "id" ? "Hapus pengguna" : "Delete user"}
        description={deleting ? `${deleting.full_name || ""} (${deleting.email})` : undefined}
      >
        {deleting && (
          <form onSubmit={handleDelete}>
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-red-800">
              {language === "id"
                ? "Akun login dan profil dihapus permanen dan tidak bisa dibatalkan. Request dan klaim yang pernah dibuat tetap ada. Jika hanya ingin memblokir sementara, gunakan Nonaktifkan."
                : "The login and profile are deleted permanently. This can't be undone. Requests and claims they created are kept. To block access temporarily, use Deactivate instead."}
            </div>
            <Field>
              <Label htmlFor="delete-confirm">
                {language === "id" ? "Ketik email pengguna untuk konfirmasi" : "Type the user's email to confirm"}
              </Label>
              <Input
                id="delete-confirm"
                autoComplete="off"
                spellCheck={false}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deleting.email}
              />
            </Field>
            {deleteError && (
              <p role="alert" className="mb-3 text-xs text-red">
                {deleteError}
              </p>
            )}
            <div className="mt-2 flex justify-end gap-2.5 border-t border-divider pt-4">
              <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={deleteBusy}
                disabled={deleteConfirm.trim().toLowerCase() !== (deleting.email ?? "").toLowerCase()}
              >
                <Trash className="h-4 w-4" /> {language === "id" ? "Hapus permanen" : "Delete permanently"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

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
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block font-semibold">{t("logs_col_user")}</span>
                <span className="font-semibold text-slate-800">{inspectRow.changed_by}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block font-semibold">{t("logs_col_time")}</span>
                <span className="font-mono text-slate-800">{formatDate(inspectRow.changed_at, true)}</span>
              </div>
            </div>

            {inspectRow.old_value && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {language === "id" ? "Nilai Sebelumnya (Before)" : "Previous Value (Before)"}:
                </span>
                <pre className="max-h-36 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 border border-slate-800 scrollbar-thin">
                  {JSON.stringify(inspectRow.old_value, null, 2)}
                </pre>
              </div>
            )}

            {inspectRow.new_value && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {language === "id" ? "Nilai Baru (After / Payload)" : "New Value (After / Payload)"}:
                </span>
                <pre className="max-h-36 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-blue-400 border border-slate-800 scrollbar-thin">
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
