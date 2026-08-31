"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, CheckCircle2, Circle, Paperclip, Upload, X, Pencil } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Toolbar } from "@/components/shared/Toolbar";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { formatDate, cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const CATEGORY_OPTIONS = ["Demo", "Onboarding", "Support", "Internal", "Lainnya"];
const ATTACH_BUCKET = "mom-attachments";

interface ActionItem {
  label: string;
  pic: string;
  due_date: string;
  done: boolean;
}

interface Attachment {
  name: string;
  path: string;
  type: string;
}

const emptyForm = {
  title: "",
  meeting_date: "",
  category: "Demo",
  merchant_partner: "",
  participants: "",
  discussion_points: "",
};

function MomPageInner() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const params = useSearchParams();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [actionItems, setActionItems] = useState<ActionItem[]>([{ label: "", pic: "", due_date: "", done: false }]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select("*")
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
    if (params.get("event_id")) {
      openCreate();
      setForm((p) => ({
        ...p,
        title: params.get("title") ?? "",
        meeting_date: new Date().toISOString().slice(0, 10),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.merchant_partner?.toLowerCase().includes(search.toLowerCase())
  );

  function updateActionItem(idx: number, patch: Partial<ActionItem>) {
    setActionItems((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setActionItems([{ label: "", pic: "", due_date: "", done: false }]);
    setAttachments([]);
    setDialogOpen(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setForm({
      title: row.title ?? "",
      meeting_date: row.meeting_date ? String(row.meeting_date).slice(0, 10) : "",
      category: row.category ?? "Demo",
      merchant_partner: row.merchant_partner ?? "",
      participants: row.participants ?? "",
      discussion_points: row.discussion_points ?? "",
    });
    const items: ActionItem[] = row.action_items ?? [];
    setActionItems(items.length ? items : [{ label: "", pic: "", due_date: "", done: false }]);
    setAttachments(row.attachments ?? []);
    setDetail(null);
    setDialogOpen(true);
  }

  async function uploadFiles(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    if (!isSupabaseConfigured) {
      toast.error(language === "id" ? "Supabase belum terhubung." : "Supabase is not connected.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    for (const file of list) {
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from(ATTACH_BUCKET).upload(path, file);
      if (error) {
        toast.error(`${file.name}: ${error.message}`);
        continue;
      }
      setAttachments((prev) => [...prev, { name: file.name, path, type: file.type }]);
    }
    setUploading(false);
  }

  async function openAttachment(path: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrl(path, 120);
    if (error || !data) {
      toast.error(language === "id" ? "Gagal membuka dokumen." : "Failed to open document.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        title: form.title,
        meeting_date: form.meeting_date,
        category: form.category,
        merchant_partner: form.merchant_partner || null,
        participants: form.participants,
        discussion_points: form.discussion_points,
        action_items: actionItems.filter((a) => a.label.trim() !== ""),
        attachments,
      };
      if (editingId) {
        const { error } = await supabase.from("meeting_minutes").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success(t("toast_updated"));
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("meeting_minutes")
          .insert({ ...payload, created_by: userData.user?.email ?? null });
        if (error) throw error;
        toast.success(t("toast_created"));
      }
      setDialogOpen(false);
      fetchRows();
    } catch (err: any) {
      toast.error(`${t("save_error")}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnDef<any>[] = [
    { key: "title", label: t("mom_col_title") },
    { key: "merchant_partner", label: t("mom_col_merchant"), render: (r) => r.merchant_partner ?? "-" },
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
            <CheckCircle2 className={`h-4 w-4 ${done === items.length && done > 0 ? "text-status-success" : "text-ink-faint"}`} />
            {done}/{items.length} {language === "id" ? "selesai" : "done"}
          </span>
        );
      },
    },
    {
      key: "attachments",
      label: t("mom_col_docs"),
      render: (r) => {
        const atts: Attachment[] = r.attachments ?? [];
        if (atts.length === 0) return <span className="text-ink-faint">-</span>;
        return (
          <span className="inline-flex items-center gap-1 text-ink-body">
            <Paperclip className="h-3.5 w-3.5 text-ink-muted" />
            {atts.length}
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
        searchPlaceholder={language === "id" ? "Cari judul / partner..." : "Search title / partner..."}
      />

      <DataTable columns={columns} rows={filtered} emptyText={loading ? t("loading") : t("no_data")} onRowClick={setDetail} />

      {/* ── Detail view modal ─────────────────────────────────────── */}
      {detail && (
        <Dialog
          open={!!detail}
          onClose={() => setDetail(null)}
          title={detail.title}
          description={`${formatDate(detail.meeting_date)}${detail.category ? ` · ${detail.category}` : ""}${
            detail.merchant_partner ? ` · ${detail.merchant_partner}` : ""
          }`}
          width="max-w-2xl"
        >
          <div className="space-y-5">
            {detail.participants && (
              <section>
                <p className="label-mono mb-1 text-ink-muted">{t("mom_view_participants")}</p>
                <p className="text-sm text-ink-body">{detail.participants}</p>
              </section>
            )}

            {detail.discussion_points && (
              <section>
                <p className="label-mono mb-1 text-ink-muted">{t("mom_view_discussion")}</p>
                <p className="whitespace-pre-wrap break-words text-sm text-ink-body">{detail.discussion_points}</p>
              </section>
            )}

            <section>
              <p className="label-mono mb-2 text-ink-muted">{t("mom_view_actions")}</p>
              {(detail.action_items ?? []).length === 0 ? (
                <p className="text-sm text-ink-muted">-</p>
              ) : (
                <ul className="space-y-2">
                  {(detail.action_items as ActionItem[]).map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-md border border-surface-border bg-surface-canvas p-2.5">
                      {a.done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words text-sm text-ink-body">{a.label}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {a.pic ? `PIC: ${a.pic}` : ""}
                          {a.pic && a.due_date ? " · " : ""}
                          {a.due_date ? formatDate(a.due_date) : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="label-mono mb-2 text-ink-muted">{t("mom_view_docs")}</p>
              {(detail.attachments ?? []).length === 0 ? (
                <p className="text-sm text-ink-muted">{t("mom_no_docs")}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(detail.attachments as Attachment[]).map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openAttachment(a.path)}
                      title={a.name}
                      className="inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-surface-border bg-surface px-2.5 py-1 text-xs text-ink-body transition-colors hover:border-accent-line hover:text-accent"
                    >
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{a.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 border-t border-surface-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setDetail(null)}>
              {t("close")}
            </Button>
            <Button type="button" variant="accent" onClick={() => openEdit(detail)}>
              <Pencil className="h-4 w-4" /> {t("edit")}
            </Button>
          </div>
        </Dialog>
      )}

      {/* ── Create / edit form ────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? t("mom_edit_title") : language === "id" ? "Form MOM / Notulen Meeting" : "Minutes of Meeting Form"}
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
              <Input
                value={form.merchant_partner}
                onChange={(e) => setForm((p) => ({ ...p, merchant_partner: e.target.value }))}
                placeholder={t("mom_partner_ph")}
              />
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

          {/* Attachments — drag & drop, any format */}
          <Field>
            <Label>{t("mom_col_docs")}</Label>
            {attachments.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {attachments.map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-md border border-surface-border bg-surface px-2.5 py-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => openAttachment(a.path)}
                      className="flex min-w-0 items-center gap-1.5 text-ink-body hover:text-accent"
                    >
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span className="truncate">{a.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, x) => x !== i))}
                      aria-label={language === "id" ? "Hapus dokumen" : "Remove document"}
                      className="rounded p-1 text-ink-faint transition-colors hover:bg-red-50 hover:text-status-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                uploadFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-5 text-center transition-colors",
                dragActive ? "border-accent bg-accent-soft" : "border-surface-border bg-surface-canvas hover:border-accent-line"
              )}
            >
              <input type="file" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
              <Upload className="h-5 w-5 text-accent" />
              <span className="text-xs font-semibold text-ink-body">{uploading ? t("mom_uploading") : t("mom_drop")}</span>
              <span className="text-[11px] text-ink-muted">{t("mom_any_format")}</span>
            </label>
          </Field>

          <Label>{language === "id" ? "Action Item & PIC" : "Action Items & Assigned PIC"}</Label>
          <div className="mb-4 space-y-2.5 rounded-lg border border-surface-border bg-surface-canvas p-3">
            {actionItems.map((item, idx) => (
              <div key={idx} className="rounded-md border border-surface-border bg-surface p-2.5 space-y-2">
                <Textarea
                  className="min-h-[52px] leading-normal"
                  placeholder={language === "id" ? "Deskripsi tugas (teks panjang akan turun ke bawah)" : "Task description (long text wraps to the next line)"}
                  value={item.label}
                  onChange={(e) => updateActionItem(idx, { label: e.target.value })}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-ink-body">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(e) => updateActionItem(idx, { done: e.target.checked })}
                      className="h-4 w-4 rounded accent-accent"
                    />
                    {language === "id" ? "Selesai" : "Done"}
                  </label>
                  <Input className="w-24 sm:w-32" placeholder="PIC" value={item.pic} onChange={(e) => updateActionItem(idx, { pic: e.target.value })} />
                  <Input type="date" className="w-36 sm:w-40" value={item.due_date} onChange={(e) => updateActionItem(idx, { due_date: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => setActionItems((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label={language === "id" ? "Hapus action item" : "Remove action item"}
                    className="ml-auto rounded-md p-2 text-ink-faint transition-colors hover:bg-red-50 hover:text-status-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActionItems((prev) => [...prev, { label: "", pic: "", due_date: "", done: false }])}
              className="mt-1 text-accent hover:bg-accent-soft"
            >
              <Plus className="h-4 w-4" /> {language === "id" ? "Tambah Action Item" : "Add Action Item"}
            </Button>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-surface-border pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={saving} disabled={uploading}>
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
