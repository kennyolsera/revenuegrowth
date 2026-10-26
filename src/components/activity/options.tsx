"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { ColourPicker } from "@/components/calendar/EventTypeField";
import { EVENT_TYPE_COLOR_CLASSES, type EventTypeColor } from "@/lib/calendar-event-types";
import { findOption, optionsFor, type ActivityOption, type OptionField } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

export const NEW_OPTION = "__new__";

export const OPT_COPY = {
  none: { id: "—", en: "—" },
  newOption: { id: "+ Opsi baru…", en: "+ New option…" },
  newName: { id: "Nama opsi baru", en: "New option name" },
  add: { id: "Tambah", en: "Add" },
  cancel: { id: "Batal", en: "Cancel" },
  errEmpty: { id: "Nama opsi wajib diisi.", en: "Enter an option name." },
  errTaken: { id: "Opsi dengan nama itu sudah ada.", en: "That option already exists." },
};

export function chip(color: EventTypeColor | undefined) {
  return EVENT_TYPE_COLOR_CLASSES[color ?? "gray"].chip;
}

/** Insert one option at the end of its list; returns the new row or an error message. */
export async function createOption(
  options: ActivityOption[],
  field: OptionField,
  label: string,
  color: EventTypeColor,
  language: "id" | "en"
): Promise<{ option?: ActivityOption; error?: string }> {
  const clean = label.trim().replace(/\s+/g, " ");
  if (!clean) return { error: OPT_COPY.errEmpty[language] };
  if (findOption(options, field, clean)) return { error: OPT_COPY.errTaken[language] };
  const sort = Math.max(0, ...optionsFor(options, field).map((o) => o.sort)) + 10;
  const { data, error } = await createClient()
    .from("activity_options")
    .insert({ field, label: clean, color, sort })
    .select("id, field, label, color, sort")
    .single();
  if (error) return { error: error.code === "23505" ? OPT_COPY.errTaken[language] : error.message };
  return { option: data as ActivityOption };
}

/**
 * A list value shown as a coloured chip that is itself a native <select>, so a
 * row can be changed in place like the sheet (keyboard and screen readers work).
 */
export function OptionChipSelect({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: string | null;
  options: ActivityOption[];
  onChange: (id: string | null) => void;
  label: string;
  disabled?: boolean;
}) {
  const { language } = useLanguage();
  const current = options.find((o) => o.id === value);
  return (
    // Explicit min-width from the label length so a tight table grows (and scrolls)
    // instead of squashing the chip to "C…"; very long labels cap at 220px.
    <span
      className={cn(
        "relative inline-flex items-center whitespace-nowrap rounded-md text-xs font-semibold",
        current ? chip(current.color) : "border border-dashed border-border-strong text-text-4"
      )}
      style={{ minWidth: `min(220px, calc(${(current?.label ?? "—").length}ch + 2.25rem))`, maxWidth: 240 }}
    >
      <select
        aria-label={label}
        value={value ?? ""}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value || null)}
        title={current?.label}
        className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent py-0.5 pl-2 pr-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md disabled:cursor-default"
      >
        <option value="">{OPT_COPY.none[language]}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-70" />
    </span>
  );
}

/** Form field: pick an option, or add a new one inline ("+ New option…"). */
export function OptionSelectField({
  id,
  field,
  label,
  value,
  options,
  onChange,
  onOptionCreated,
}: {
  id: string;
  field: OptionField;
  label: string;
  value: string | null;
  options: ActivityOption[];
  onChange: (id: string | null) => void;
  onOptionCreated: (o: ActivityOption) => void;
}) {
  const { language } = useLanguage();
  const list = optionsFor(options, field);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<EventTypeColor>("gray");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    const res = await createOption(options, field, name, color, language);
    setBusy(false);
    if (res.error || !res.option) return setError(res.error ?? "");
    onOptionCreated(res.option);
    onChange(res.option.id);
    setAdding(false);
    setName("");
    setError(null);
  }

  const current = list.find((o) => o.id === value);

  return (
    <div className={cn("mb-4", adding && "sm:col-span-2")}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Select
          id={id}
          value={adding ? NEW_OPTION : value ?? ""}
          onChange={(e) => {
            setError(null);
            if (e.target.value === NEW_OPTION) return setAdding(true);
            setAdding(false);
            onChange(e.target.value || null);
          }}
        >
          <option value="">{OPT_COPY.none[language]}</option>
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
          <option value={NEW_OPTION}>{OPT_COPY.newOption[language]}</option>
        </Select>
        {current && !adding && <span aria-hidden className={cn("h-3 w-3 shrink-0 rounded-full", EVENT_TYPE_COLOR_CLASSES[current.color].swatch)} />}
      </div>
      {adding && (
        <div className="mt-2 space-y-2 rounded-md border border-border bg-surface-2 p-3">
          <Label htmlFor={`${id}-new`}>{OPT_COPY.newName[language]}</Label>
          <Input
            id={`${id}-new`}
            autoFocus
            maxLength={120}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              } else if (e.key === "Escape") {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setAdding(false);
              }
            }}
          />
          <ColourPicker value={color} onChange={setColor} idPrefix={`${id}-colour`} />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="accent" loading={busy} onClick={add}>
              <Plus className="h-3.5 w-3.5" /> {OPT_COPY.add[language]}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAdding(false)}>
              {OPT_COPY.cancel[language]}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red">
          {error}
        </p>
      )}
    </div>
  );
}
