"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, PencilSimple as Pencil, Plus, Trash as Trash2 } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ColourPicker } from "@/components/calendar/EventTypeField";
import type { EventTypeColor } from "@/lib/calendar-event-types";
import { OPTION_FIELDS, findOption, optionsFor, type ActivityOption, type OptionField } from "@/lib/oo-activity";
import { chip, createOption } from "@/components/oo-activity/options";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const COPY = {
  title: { id: "Kelola daftar", en: "Edit lists" },
  desc: {
    id: "Tambah, ubah nama, ganti warna, atur urutan, atau hapus opsi. Perubahan langsung berlaku di semua baris.",
    en: "Add, rename, recolour, reorder or delete options. Changes apply to every row straight away.",
  },
  add: { id: "Tambah opsi", en: "Add option" },
  newName: { id: "Nama opsi", en: "Option name" },
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  edit: { id: "Ubah", en: "Edit" },
  remove: { id: "Hapus", en: "Delete" },
  up: { id: "Naikkan", en: "Move up" },
  down: { id: "Turunkan", en: "Move down" },
  used: { id: "{n} baris", en: "{n} rows" },
  usedOne: { id: "1 baris", en: "1 row" },
  confirm: { id: "Hapus \"{name}\"?", en: "Delete \"{name}\"?" },
  inUse: {
    id: "\"{name}\" masih dipakai {n} baris. Ganti opsi di baris tersebut dulu.",
    en: "\"{name}\" is still used by {n} rows. Change those rows first.",
  },
  empty: { id: "Belum ada opsi.", en: "No options yet." },
  errEmpty: { id: "Nama opsi wajib diisi.", en: "Enter an option name." },
  errTaken: { id: "Opsi dengan nama itu sudah ada.", en: "That option already exists." },
  close: { id: "Tutup", en: "Close" },
};

export function OptionsManager({
  open,
  onClose,
  options,
  usage,
  initialField = "source",
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  options: ActivityOption[];
  /** option id → number of rows using it (from the loaded records). */
  usage: Map<string, number>;
  initialField?: OptionField;
  onChanged: () => Promise<void> | void;
}) {
  const { language } = useLanguage();
  const toast = useToast();
  const c = (k: keyof typeof COPY, vars: Record<string, string | number> = {}) =>
    Object.entries(vars).reduce((s, [k2, v]) => s.replace(`{${k2}}`, String(v)), COPY[k][language]);

  const [field, setField] = useState<OptionField>(initialField);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState<EventTypeColor>("gray");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState<EventTypeColor>("gray");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setField(initialField);
    reset();
  }, [open, initialField]);

  function reset() {
    setEditId(null);
    setConfirmId(null);
    setError(null);
    setNewLabel("");
  }

  const list = optionsFor(options, field);
  const supabase = createClient();

  async function add() {
    setBusy(true);
    const res = await createOption(options, field, newLabel, newColor, language);
    setBusy(false);
    if (res.error) return setError(res.error);
    toast.success(`${COPY.add[language]}: ${res.option!.label}`);
    setNewLabel("");
    setError(null);
    await onChanged();
  }

  async function save(o: ActivityOption) {
    const label = editLabel.trim().replace(/\s+/g, " ");
    if (!label) return setError(COPY.errEmpty[language]);
    const clash = findOption(options, field, label);
    if (clash && clash.id !== o.id) return setError(COPY.errTaken[language]);
    setBusy(true);
    const { error: err } = await supabase.from("online_order_followup_options").update({ label, color: editColor }).eq("id", o.id);
    setBusy(false);
    if (err) return setError(err.code === "23505" ? COPY.errTaken[language] : err.message);
    setEditId(null);
    setError(null);
    await onChanged();
  }

  async function remove(o: ActivityOption) {
    setBusy(true);
    const { error: err } = await supabase.from("online_order_followup_options").delete().eq("id", o.id);
    setBusy(false);
    setConfirmId(null);
    if (err) {
      return setError(err.code === "23503" ? c("inUse", { name: o.label, n: usage.get(o.id) ?? "?" }) : err.message);
    }
    toast.success(`${COPY.remove[language]}: ${o.label}`);
    setError(null);
    await onChanged();
  }

  async function move(o: ActivityOption, dir: -1 | 1) {
    const idx = list.findIndex((x) => x.id === o.id);
    const other = list[idx + dir];
    if (!other) return;
    // Renumber the whole list so equal sort values can't get stuck.
    const order = list.map((x) => x.id);
    [order[idx], order[idx + dir]] = [order[idx + dir], order[idx]];
    setBusy(true);
    const results = await Promise.all(
      order.map((id, i) => supabase.from("online_order_followup_options").update({ sort: (i + 1) * 10 }).eq("id", id))
    );
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) setError(failed.error.message);
    await onChanged();
  }

  const escOnlyInline = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    } else if (e.key === "Escape" && editId) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setEditId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={COPY.title[language]} description={COPY.desc[language]} width="max-w-2xl">
      <div role="tablist" aria-label={COPY.title[language]} className="mb-4 flex flex-wrap gap-1 rounded-md bg-surface-3 p-0.5">
        {OPTION_FIELDS.map((f) => (
          <button
            key={f.field}
            type="button"
            role="tab"
            aria-selected={field === f.field}
            onClick={() => {
              setField(f.field);
              reset();
            }}
            className={cn(
              "h-7 rounded-xs px-3 text-[12.5px] font-medium transition-colors",
              field === f.field ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
            )}
          >
            {f.label[language]}
            <span className="ml-1.5 text-text-4">{optionsFor(options, f.field).length}</span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-divider rounded-md border border-border" aria-label={OPTION_FIELDS.find((f) => f.field === field)?.label[language]}>
        {list.length === 0 && <li className="p-3 text-sm text-text-3">{COPY.empty[language]}</li>}
        {list.map((o, i) => (
          <li key={o.id} className="p-2.5">
            {editId === o.id ? (
              <div className="space-y-2">
                <Input
                  aria-label={COPY.newName[language]}
                  autoFocus
                  maxLength={120}
                  value={editLabel}
                  onChange={(e) => {
                    setEditLabel(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => escOnlyInline(e, () => save(o))}
                />
                <ColourPicker value={editColor} onChange={setEditColor} idPrefix={`edit-${o.id}`} />
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="accent" loading={busy} onClick={() => save(o)}>
                    <Check className="h-3.5 w-3.5" /> {COPY.save[language]}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditId(null)}>
                    {COPY.cancel[language]}
                  </Button>
                </div>
              </div>
            ) : confirmId === o.id ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-2">
                <span>{c("confirm", { name: o.label })}</span>
                <span className="flex gap-2">
                  <Button type="button" size="sm" variant="danger" loading={busy} onClick={() => remove(o)}>
                    {COPY.remove[language]}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmId(null)}>
                    {COPY.cancel[language]}
                  </Button>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={cn("truncate rounded-md px-2 py-0.5 text-xs font-semibold", chip(o.color))}>{o.label}</span>
                <span className="text-xs text-text-4">{(usage.get(o.id) ?? 0) === 1 ? COPY.usedOne[language] : c("used", { n: usage.get(o.id) ?? 0 })}</span>
                <span className="ml-auto flex gap-0.5">
                  <IconBtn label={`${COPY.up[language]}: ${o.label}`} disabled={i === 0 || busy} onClick={() => move(o, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn label={`${COPY.down[language]}: ${o.label}`} disabled={i === list.length - 1 || busy} onClick={() => move(o, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label={`${COPY.edit[language]}: ${o.label}`}
                    onClick={() => {
                      setEditId(o.id);
                      setEditLabel(o.label);
                      setEditColor(o.color);
                      setConfirmId(null);
                      setError(null);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label={`${COPY.remove[language]}: ${o.label}`}
                    danger
                    onClick={() => {
                      setConfirmId(o.id);
                      setEditId(null);
                      setError(null);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </IconBtn>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 rounded-md border border-border bg-surface-2 p-3">
        <Label htmlFor="opt-new">{COPY.add[language]}</Label>
        <div className="flex gap-2">
          <Input
            id="opt-new"
            maxLength={120}
            value={newLabel}
            placeholder={COPY.newName[language]}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => escOnlyInline(e, add)}
          />
          <Button type="button" size="sm" variant="accent" loading={busy} onClick={add}>
            <Plus className="h-3.5 w-3.5" /> {COPY.add[language]}
          </Button>
        </div>
        <ColourPicker value={newColor} onChange={setNewColor} idPrefix="opt-new-colour" />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end border-t border-divider pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {COPY.close[language]}
        </Button>
      </div>
    </Dialog>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded p-1.5 text-text-3 transition-colors disabled:opacity-30",
        danger ? "hover:bg-red-50 hover:text-red-700" : "hover:bg-surface-3 hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

