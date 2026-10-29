"use client";

import { useEffect, useState } from "react";
import { Trash as Trash2 } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, Textarea } from "@/components/ui/Input";
import { OPTION_FIELDS, type ActivityOption, type ActivityRecord, type OptionColumn } from "@/lib/oo-activity";
import { OptionSelectField } from "@/components/oo-activity/options";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const COPY = {
  newTitle: { id: "Follow up baru", en: "New follow-up" },
  editTitle: { id: "Ubah follow up", en: "Edit follow-up" },
  date: { id: "Tanggal", en: "Date" },
  store: { id: "URL toko", en: "Store URL" },
  storePh: { id: "mis. omahsosisbojonegoro", en: "e.g. omahsosisbojonegoro" },
  phone: { id: "Nomor telp", en: "Phone" },
  minutes: { id: "Menit", en: "Minutes" },
  notes: { id: "Keterangan", en: "Notes" },
  save: { id: "Simpan", en: "Save" },
  create: { id: "Tambah follow up", en: "Add follow-up" },
  cancel: { id: "Batal", en: "Cancel" },
  remove: { id: "Hapus", en: "Delete" },
  confirm: { id: "Hapus follow up ini?", en: "Delete this follow-up?" },
  errStore: { id: "URL toko wajib diisi.", en: "Enter the store URL." },
  errMinutes: { id: "Menit harus angka 0 sampai 1440.", en: "Minutes must be a number from 0 to 1440." },
  saved: { id: "Follow up disimpan", en: "Follow-up saved" },
  created: { id: "Follow up ditambahkan", en: "Follow-up added" },
  deleted: { id: "Follow up dihapus", en: "Follow-up deleted" },
  saveError: { id: "Gagal menyimpan", en: "Couldn't save" },
};

type Form = {
  activity_date: string;
  store_name: string;
  phone: string;
  minutes: string;
  notes: string;
} & Record<OptionColumn, string | null>;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function emptyForm(): Form {
  return {
    activity_date: today(),
    store_name: "",
    phone: "",
    minutes: "",
    notes: "",
    subs_id: null,
    status_id: null,
    source_id: null,
    product_id: null,
    perihal_id: null,
  };
}

export function ActivityDialog({
  open,
  record,
  options,
  onClose,
  onSaved,
  onOptionCreated,
}: {
  open: boolean;
  record: ActivityRecord | null;
  options: ActivityOption[];
  onClose: () => void;
  onSaved: () => void;
  onOptionCreated: (o: ActivityOption) => void;
}) {
  const { language } = useLanguage();
  const toast = useToast();
  const merchants = useMerchantOptions();
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setConfirmDelete(false);
    setForm(
      record
        ? {
            activity_date: record.activity_date ?? "",
            store_name: record.store_name,
            phone: record.phone ?? "",
            minutes: record.minutes == null ? "" : String(record.minutes),
            notes: record.notes ?? "",
            subs_id: record.subs_id,
            status_id: record.status_id,
            source_id: record.source_id,
            product_id: record.product_id,
            perihal_id: record.perihal_id,
          }
        : emptyForm()
    );
  }, [open, record]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setError(null);
    setForm((f) => ({ ...f, [k]: v }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const store = form.store_name.trim().replace(/\s+/g, " ");
    if (!store) return setError(COPY.errStore[language]);
    const minText = form.minutes.trim();
    const minutes = minText === "" ? null : Number(minText);
    if (minutes != null && (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440)) return setError(COPY.errMinutes[language]);
    const payload = {
      activity_date: form.activity_date || null,
      store_name: store,
      phone: form.phone.trim() || null,
      minutes,
      notes: form.notes.trim() || null,
      subs_id: form.subs_id,
      status_id: form.status_id,
      source_id: form.source_id,
      product_id: form.product_id,
      perihal_id: form.perihal_id,
    };
    setSaving(true);
    const supabase = createClient();
    const result = record
      ? await supabase.from("online_order_followups").update(payload).eq("id", record.id)
      : await supabase
          .from("online_order_followups")
          .insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.email ?? null });
    setSaving(false);
    if (result.error) return setError(`${COPY.saveError[language]}: ${result.error.message}`);
    toast.success(record ? COPY.saved[language] : COPY.created[language]);
    onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!record) return;
    setSaving(true);
    const { error: err } = await createClient().from("online_order_followups").delete().eq("id", record.id);
    setSaving(false);
    if (err) return setError(`${COPY.saveError[language]}: ${err.message}`);
    toast.success(COPY.deleted[language]);
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={record ? COPY.editTitle[language] : COPY.newTitle[language]} width="max-w-2xl">
      <form onSubmit={handleSave} noValidate>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[1fr_2fr]">
          <Field>
            <Label htmlFor="act-date">{COPY.date[language]}</Label>
            <Input id="act-date" type="date" value={form.activity_date} onChange={(e) => set("activity_date", e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="act-store">{COPY.store[language]}</Label>
            <Input
              id="act-store"
              list="act-store-options"
              autoFocus={!record}
              maxLength={200}
              value={form.store_name}
              placeholder={COPY.storePh[language]}
              onChange={(e) => set("store_name", e.target.value)}
            />
            <datalist id="act-store-options">
              {merchants.map((m) => (
                <option key={m.value} value={m.label} />
              ))}
            </datalist>
          </Field>
          <Field>
            <Label htmlFor="act-phone">{COPY.phone[language]}</Label>
            <Input id="act-phone" inputMode="tel" maxLength={40} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="act-minutes">{COPY.minutes[language]}</Label>
            <Input id="act-minutes" type="number" inputMode="numeric" min={0} max={1440} step={1} value={form.minutes} placeholder="10" onChange={(e) => set("minutes", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {OPTION_FIELDS.map((f) => (
            <OptionSelectField
              key={f.field}
              id={`act-${f.field}`}
              field={f.field}
              label={f.label[language]}
              value={form[f.column]}
              options={options}
              onChange={(id) => set(f.column, id)}
              onOptionCreated={onOptionCreated}
            />
          ))}
        </div>

        <Field>
          <Label htmlFor="act-notes">{COPY.notes[language]}</Label>
          <Textarea id="act-notes" maxLength={2000} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        {error && (
          <p role="alert" className="mb-3 text-xs text-red">
            {error}
          </p>
        )}

        {confirmDelete && (
          <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface-2 p-3 text-xs text-text-2">
            <span>{COPY.confirm[language]}</span>
            <span className="flex gap-2">
              <Button type="button" size="sm" variant="danger" loading={saving} onClick={handleDelete}>
                {COPY.remove[language]}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>
                {COPY.cancel[language]}
              </Button>
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-divider pt-4">
          {record ? (
            <Button type="button" variant="ghost" size="sm" className="text-red" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> {COPY.remove[language]}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {COPY.cancel[language]}
            </Button>
            <Button type="submit" variant="accent" loading={saving}>
              {record ? COPY.save[language] : COPY.create[language]}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
