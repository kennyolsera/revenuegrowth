"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

const CATEGORY_OPTIONS = ["Demo", "Onboarding", "Support", "Internal", "Lainnya"];

interface ActionItem {
  label: string;
  pic: string;
  due_date: string;
  done: boolean;
}

const emptyForm = {
  title: "",
  meeting_date: "",
  category: "Demo",
  merchant_id: "",
  participants: "",
  discussion_points: "",
};

function MomPageInner() {
  const { t, language } = useLanguage();
  const params = useSearchParams();
  const merchantOptions = useMerchantOptions();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [actionItems, setActionItems] = useState<ActionItem[]>([{ label: "", pic: "", due_date: "", done: false }]);
  const [saving, setSaving] = useState(false);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select("*, merchant:merchants(name)")
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      setRows(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading MOM");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    const eventId = params.get("event_id");
    if (eventId) {
      setForm((p) => ({
        ...p,
        title: params.get("title") ?? "",
        merchant_id: params.get("merchant_id") ?? "",
        meeting_date: new Date().toISOString().slice(0, 10),
      }));
      setDialogOpen(true);
    }
  }, []);

  const filtered = rows.filter(
    (r) => !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.merchant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  function updateActionItem(idx: number, patch: Partial<ActionItem>) {
    setActionItems((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function openCreate() {
    setForm(emptyForm);
    setActionItems([{ label: "", pic: "", due_date: "", done: false }]);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("meeting_minutes").insert({
        title: form.title,
        meeting_date: form.meeting_date,
        category: form.category,
        merchant_id: form.merchant_id || null,
        participants: form.participants,
        discussion_points: form.discussion_points,
        action_items: actionItems.filter((a) => a.label.trim() !== ""),
        created_by: userData.user?.email ?? null,
      });
      if (error) throw error;
      setDialogOpen(false);
      fetchRows();
    } catch (err: any) {
      alert(`${t("save_error")}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnDef<any>[] = [
    { key: "title", label: t("mom_col_title") },
    { key: "merchant", label: t("mom_col_merchant"), render: (r) => r.merchant?.name ?? "-" },
    { key: "category", label: t("mom_col_category") },
    { key: "meeting_date", label: t("mom_col_date"), render: (r) => formatDate(r.meeting_date) },
    {
      key: "action_items",
      label: t("mom_col_actions"),
      render: (r) => {
        const items: ActionItem[] = r.action_items ?? [];
        const done = items.filter((a) => a.done).length;
        return (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CheckCircle2 className={`h-4 w-4 ${done === items.length && done > 0 ? "text-emerald-600" : "text-slate-300"}`} />
            {done}/{items.length} {language === "id" ? "selesai" : "done"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("mom_title")}
        description={t("mom_desc")}
        action={
          <Button size="sm" variant="accent" onClick={openCreate}>
            <Plus className="h-4 w-4" /> {t("mom_add")}
          </Button>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={language === "id" ? "Cari judul / merchant..." : "Search title / merchant..."}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        emptyText={loading ? t("loading") : t("no_data")}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={language === "id" ? "Form MOM / Notulen Meeting" : "Minutes of Meeting Form"}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field>
              <Label>{t("mom_col_title")}</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={language === "id" ? "mis. Notulen Kickoff Merchant Y" : "e.g. Kickoff Meeting with Merchant Y"}
              />
            </Field>
            <Field>
              <Label>{t("mom_col_date")}</Label>
              <Input type="date" required value={form.meeting_date} onChange={(e) => setForm((p) => ({ ...p, meeting_date: e.target.value }))} />
            </Field>
            <Field>
              <Label>{t("mom_col_category")}</Label>
              <Select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>{t("mom_col_merchant")}</Label>
              <Select value={form.merchant_id} onChange={(e) => setForm((p) => ({ ...p, merchant_id: e.target.value }))}>
                <option value="">{language === "id" ? "Tidak ada" : "None"}</option>
                {merchantOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field>
            <Label>{language === "id" ? "Peserta (Internal & Eksternal)" : "Participants (Internal & External)"}</Label>
            <Input value={form.participants} onChange={(e) => setForm((p) => ({ ...p, participants: e.target.value }))} placeholder="Nama peserta, tim, atau email" />
          </Field>
          <Field>
            <Label>{language === "id" ? "Poin Pembahasan" : "Discussion Points"}</Label>
            <Textarea
              required
              value={form.discussion_points}
              onChange={(e) => setForm((p) => ({ ...p, discussion_points: e.target.value }))}
              placeholder={"1. ...\n2. ...\n3. ..."}
            />
          </Field>

          <Label>{language === "id" ? "Action Item & PIC" : "Action Items & Assigned PIC"}</Label>
          <div className="mb-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            {actionItems.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder={language === "id" ? "Deskripsi tugas" : "Task description"}
                  value={item.label}
                  onChange={(e) => updateActionItem(idx, { label: e.target.value })}
                />
                <Input className="w-28 sm:w-32" placeholder="PIC" value={item.pic} onChange={(e) => updateActionItem(idx, { pic: e.target.value })} />
                <Input type="date" className="w-36 sm:w-40" value={item.due_date} onChange={(e) => updateActionItem(idx, { due_date: e.target.value })} />
                <button
                  type="button"
                  onClick={() => setActionItems((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-status-danger transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActionItems((prev) => [...prev, { label: "", pic: "", due_date: "", done: false }])}
              className="mt-1 text-accent hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" /> {language === "id" ? "Tambah Action Item" : "Add Action Item"}
            </Button>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={saving}>
              {t("save")}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default function MomPage() {
  return (
    <Suspense fallback={null}>
      <MomPageInner />
    </Suspense>
  );
}
