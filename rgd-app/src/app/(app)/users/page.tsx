"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

export default function UsersPage() {
  const { t, language } = useLanguage();

  const ROLE_OPTIONS = [
    { value: "super_admin", label: "Super Admin" },
    { value: "head_rg", label: "Head of Revenue Growth" },
    { value: "team_rg", label: language === "id" ? "Tim Revenue Growth" : "Revenue Growth Team" },
    { value: "external_team", label: language === "id" ? "Tim Eksternal" : "External Team" },
    { value: "finance_ops", label: "Finance / Ops" },
  ];

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

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = rows.filter(
    (r) => !search || r.full_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())
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

  const columns: ColumnDef<any>[] = [
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

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={language === "id" ? "Cari nama / email..." : "Search name / email..."}
      />

      <DataTable
        columns={columns}
        rows={filtered}
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
    </div>
  );
}
