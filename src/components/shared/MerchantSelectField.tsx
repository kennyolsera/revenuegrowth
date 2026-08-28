"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label } from "@/components/ui/Input";
import { useLanguage } from "@/lib/LanguageContext";
import { Store, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MerchantOption {
  value: string;
  label: string;
}

export async function resolveMerchantId(
  rawInput: string,
  existingOptions: MerchantOption[]
): Promise<string | null> {
  if (!rawInput || !rawInput.trim()) return null;
  const trimmed = rawInput.trim();

  // Matches an existing UUID
  const matchById = existingOptions.find((o) => o.value === trimmed);
  if (matchById) return matchById.value;

  // Matches an existing merchant name (case-insensitive)
  const matchByName = existingOptions.find(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchByName) return matchByName.value;

  // Otherwise, create a new merchant record
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("merchants")
      .insert({ name: trimmed, source: "manual_input" })
      .select("id")
      .single();
    if (error) {
      console.error("Error creating new merchant:", error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error("Failed to auto-create merchant:", err);
    return null;
  }
}

/**
 * Write-first merchant combobox. The user types a name by default; existing
 * merchants surface as live suggestions. Picking a suggestion links to that
 * merchant (emits its UUID); free text emits `manual:<name>` so the submit
 * handler resolves-or-creates it. This keeps ResourceManager's contract intact.
 */
export function MerchantSelectField({
  value,
  onChange,
  required = false,
  label,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  label?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const [options, setOptions] = useState<MerchantOption[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const syncedRef = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Load merchants once
  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("merchants")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setOptions((data ?? []).map((m: any) => ({ value: m.id, label: m.name })));
      });
    return () => {
      active = false;
    };
  }, []);

  // Seed the input from an initial value (edit mode) exactly once, after load
  useEffect(() => {
    if (syncedRef.current || !value) return;
    if (options.length === 0 && value.startsWith("manual:")) {
      setQuery(value.replace("manual:", ""));
      syncedRef.current = true;
      return;
    }
    if (options.length === 0) return;
    const match = options.find((o) => o.value === value);
    if (match) {
      setQuery(match.label);
      syncedRef.current = true;
    } else if (value.startsWith("manual:")) {
      setQuery(value.replace("manual:", ""));
      syncedRef.current = true;
    }
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, options]);

  const exactMatch = useMemo(
    () => options.find((o) => o.label.toLowerCase() === query.trim().toLowerCase()) ?? null,
    [query, options]
  );

  function emit(next: string) {
    const exact = options.find((o) => o.label.toLowerCase() === next.trim().toLowerCase());
    if (exact) onChange(exact.value);
    else onChange(next.trim() ? `manual:${next.trim()}` : "");
  }

  function handleType(v: string) {
    setQuery(v);
    setOpen(true);
    setHighlight(0);
    emit(v);
  }

  function pick(o: MerchantOption) {
    setQuery(o.label);
    onChange(o.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && suggestions[highlight]) {
      e.preventDefault();
      pick(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showCreateHint = query.trim().length > 0 && !exactMatch;

  return (
    <div ref={boxRef} className={cn("relative space-y-1.5", className)}>
      {label && (
        <Label className="flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5 text-accent" />
          {label}
          {required && <span className="text-rose-500">*</span>}
        </Label>
      )}

      <Input
        type="text"
        required={required}
        autoComplete="off"
        placeholder={t("merchant_field_placeholder")}
        value={query}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {/* Status hint */}
      {query.trim().length > 0 && (
        <p
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-medium",
            exactMatch ? "text-emerald-600" : "text-accent"
          )}
        >
          {exactMatch ? (
            <>
              <Check className="h-3 w-3" /> {t("merchant_pick_existing")}
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" /> {t("merchant_will_create")}
            </>
          )}
        </p>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-elevated scrollbar-thin">
          {suggestions.map((o, i) => (
            <li key={o.value}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(o)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors",
                  i === highlight ? "bg-accent/[0.07] text-accent" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="truncate">{o.label}</span>
                {value === o.value && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </button>
            </li>
          ))}
          {showCreateHint && (
            <li className="border-t border-slate-100 px-3.5 py-2 text-[11px] text-slate-400">
              “{query.trim()}” — {t("merchant_will_create")}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
