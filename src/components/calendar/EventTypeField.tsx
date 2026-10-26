"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import {
  COLOR_LABELS,
  EVENT_TYPE_COLOR_CLASSES,
  EVENT_TYPE_COLORS_ORDER,
  type CalendarEventType,
  type EventTypeColor,
  isInUse,
  labelTaken,
  makeTypeKey,
} from "@/lib/calendar-event-types";

const NEW_TYPE = "__new__";

type Copy = { id: string; en: string };
const COPY = {
  label: { id: "Tipe Aktivitas", en: "Activity Type" },
  newOption: { id: "+ Tipe baru…", en: "+ New type…" },
  manage: { id: "Kelola tipe", en: "Edit types" },
  close: { id: "Tutup", en: "Close" },
  newName: { id: "Nama tipe baru", en: "New type name" },
  placeholder: { id: "mis. Workshop", en: "e.g. Workshop" },
  colour: { id: "Warna", en: "Colour" },
  add: { id: "Tambah", en: "Add" },
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  rename: { id: "Ubah", en: "Edit" },
  remove: { id: "Hapus", en: "Delete" },
  confirmRemove: { id: "Hapus tipe \"{name}\"?", en: "Delete type \"{name}\"?" },
  errEmpty: { id: "Nama tipe wajib diisi.", en: "Type name is required." },
  errTaken: { id: "Nama tipe sudah ada.", en: "That type name already exists." },
  errInUse: {
    id: "Tipe \"{name}\" masih dipakai jadwal. Ganti tipe pada jadwal tersebut dulu.",
    en: "\"{name}\" is still used by schedules. Change those schedules first.",
  },
  errReadOnly: {
    id: "Tipe aktivitas belum bisa diubah: migrasi database calendar_event_types belum dijalankan.",
    en: "Activity types can't be edited yet: the calendar_event_types database migration hasn't been applied.",
  },
  added: { id: "Tipe \"{name}\" ditambahkan", en: "Type \"{name}\" added" },
  updated: { id: "Tipe \"{name}\" diperbarui", en: "Type \"{name}\" updated" },
  deleted: { id: "Tipe \"{name}\" dihapus", en: "Type \"{name}\" deleted" },
} satisfies Record<string, Copy>;

function ColourPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: EventTypeColor;
  onChange: (c: EventTypeColor) => void;
  idPrefix: string;
}) {
  const { language } = useLanguage();
  return (
    <div role="radiogroup" aria-label={COPY.colour[language]} className="flex flex-wrap gap-1.5">
      {EVENT_TYPE_COLORS_ORDER.map((c) => (
        <button
          key={c}
          id={`${idPrefix}-${c}`}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={COLOR_LABELS[c][language]}
          title={COLOR_LABELS[c][language]}
          onClick={() => onChange(c)}
          className={cn(
            "h-6 w-6 rounded-full ring-offset-2 ring-offset-surface transition",
            EVENT_TYPE_COLOR_CLASSES[c].swatch,
            value === c ? "ring-2 ring-text" : "hover:ring-2 hover:ring-border-strong"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Activity type picker for the schedule form: choose a type, add one inline
 * ("+ New type…"), or open "Edit types" to rename, recolour or delete.
 * Stays inside the schedule dialog (no nested dialog, so Escape closes one thing).
 */
export function EventTypeField({
  value,
  onChange,
  types,
  editable,
  onTypesChanged,
}: {
  value: string;
  onChange: (key: string) => void;
  types: CalendarEventType[];
  /** False when the table is missing: fall back to the fixed list, read-only. */
  editable: boolean;
  onTypesChanged: () => Promise<void> | void;
}) {
  const { language } = useLanguage();
  const toast = useToast();
  const c = (k: keyof typeof COPY, name?: string) => COPY[k][language].replace("{name}", name ?? "");

  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState<EventTypeColor>("teal");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState<EventTypeColor>("gray");
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wide = adding || managing;
  // Keep an unknown current value selectable (e.g. a type deleted elsewhere).
  const known = types.some((t) => t.key === value);

  async function addType() {
    const label = newLabel.trim();
    if (!label) return setError(c("errEmpty"));
    if (labelTaken(types, label)) return setError(c("errTaken"));
    setBusy(true);
    const key = makeTypeKey(label);
    const sort = Math.max(0, ...types.filter((t) => t.key !== "lainnya").map((t) => t.sort)) + 10;
    const { error: err } = await createClient().from("calendar_event_types").insert({ key, label, color: newColor, sort });
    setBusy(false);
    if (err) return setError(err.code === "23505" ? c("errTaken") : err.message);
    toast.success(c("added", label));
    await onTypesChanged();
    onChange(key);
    setAdding(false);
    setNewLabel("");
    setError(null);
  }

  function startEdit(t: CalendarEventType) {
    setEditKey(t.key);
    setEditLabel(t.label);
    setEditColor(t.color);
    setConfirmKey(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editKey) return;
    const label = editLabel.trim();
    if (!label) return setError(c("errEmpty"));
    if (labelTaken(types, label, editKey)) return setError(c("errTaken"));
    setBusy(true);
    const { error: err } = await createClient().from("calendar_event_types").update({ label, color: editColor }).eq("key", editKey);
    setBusy(false);
    if (err) return setError(err.code === "23505" ? c("errTaken") : err.message);
    toast.success(c("updated", label));
    setEditKey(null);
    setError(null);
    await onTypesChanged();
  }

  async function removeType(t: CalendarEventType) {
    setBusy(true);
    const { error: err } = await createClient().from("calendar_event_types").delete().eq("key", t.key);
    setBusy(false);
    setConfirmKey(null);
    if (err) return setError(isInUse(err) ? c("errInUse", t.label) : err.message);
    toast.success(c("deleted", t.label));
    setError(null);
    if (value === t.key) onChange(types.find((x) => x.key !== t.key)?.key ?? "");
    await onTypesChanged();
  }

  // Enter inside an inline input must not submit the schedule form.
  const enterTo = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    } else if (e.key === "Escape") {
      // Close the inline editor only, not the whole dialog.
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setAdding(false);
      setEditKey(null);
    }
  };

  return (
    <Field className={cn(wide && "sm:col-span-2")}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="event-type">{COPY.label[language]}</Label>
        {editable && (
          <button
            type="button"
            onClick={() => {
              setManaging((m) => !m);
              setAdding(false);
              setEditKey(null);
              setConfirmKey(null);
              setError(null);
            }}
            aria-expanded={managing}
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden />
            {managing ? COPY.close[language] : COPY.manage[language]}
          </button>
        )}
      </div>

      <Select
        id="event-type"
        value={adding ? NEW_TYPE : value}
        onChange={(e) => {
          setError(null);
          if (e.target.value === NEW_TYPE) {
            setAdding(true);
            setManaging(false);
            return;
          }
          setAdding(false);
          onChange(e.target.value);
        }}
      >
        {!known && value && <option value={value}>{value}</option>}
        {types.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
        {editable && <option value={NEW_TYPE}>{COPY.newOption[language]}</option>}
      </Select>

      {adding && (
        <div className="mt-2 space-y-2 rounded-md border border-border bg-surface-2 p-3">
          <Label htmlFor="event-type-new">{COPY.newName[language]}</Label>
          <Input
            id="event-type-new"
            autoFocus
            maxLength={60}
            value={newLabel}
            placeholder={COPY.placeholder[language]}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setError(null);
            }}
            onKeyDown={enterTo(addType)}
          />
          <ColourPicker value={newColor} onChange={setNewColor} idPrefix="new-colour" />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="accent" loading={busy} onClick={addType}>
              <Plus className="h-3.5 w-3.5" /> {COPY.add[language]}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
            >
              {COPY.cancel[language]}
            </Button>
          </div>
        </div>
      )}

      {managing && (
        <ul className="mt-2 divide-y divide-divider rounded-md border border-border bg-surface-2" aria-label={COPY.manage[language]}>
          {types.map((t) => (
            <li key={t.key} className="p-2.5">
              {editKey === t.key ? (
                <div className="space-y-2">
                  <Input
                    aria-label={COPY.newName[language]}
                    autoFocus
                    maxLength={60}
                    value={editLabel}
                    onChange={(e) => {
                      setEditLabel(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={enterTo(saveEdit)}
                  />
                  <ColourPicker value={editColor} onChange={setEditColor} idPrefix={`edit-${t.key}`} />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="accent" loading={busy} onClick={saveEdit}>
                      <Check className="h-3.5 w-3.5" /> {COPY.save[language]}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setEditKey(null)}>
                      {COPY.cancel[language]}
                    </Button>
                  </div>
                </div>
              ) : confirmKey === t.key ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-2">
                  <span>{c("confirmRemove", t.label)}</span>
                  <span className="flex gap-2">
                    <Button type="button" size="sm" variant="danger" loading={busy} onClick={() => removeType(t)}>
                      {COPY.remove[language]}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmKey(null)}>
                      {COPY.cancel[language]}
                    </Button>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={cn("h-3 w-3 shrink-0 rounded-full", EVENT_TYPE_COLOR_CLASSES[t.color].swatch)} aria-hidden />
                  <span className={cn("truncate rounded px-1.5 py-0.5 text-xs font-semibold", EVENT_TYPE_COLOR_CLASSES[t.color].chip)}>
                    {t.label}
                  </span>
                  <span className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      aria-label={`${COPY.rename[language]} ${t.label}`}
                      className="rounded p-1.5 text-text-3 hover:bg-surface-3 hover:text-text"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmKey(t.key);
                        setEditKey(null);
                        setError(null);
                      }}
                      aria-label={`${COPY.remove[language]} ${t.label}`}
                      className="rounded p-1.5 text-text-3 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
          <li className="p-2.5">
            <button
              type="button"
              onClick={() => {
                setManaging(false);
                setAdding(true);
                setError(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> {COPY.newOption[language].replace("+ ", "")}
            </button>
          </li>
        </ul>
      )}

      {!editable && wide && <p className="mt-2 text-xs text-text-3">{c("errReadOnly")}</p>}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red">
          {error}
        </p>
      )}
    </Field>
  );
}
