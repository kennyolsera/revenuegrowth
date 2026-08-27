"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Label } from "@/components/ui/Input";
import { useLanguage } from "@/lib/LanguageContext";
import { PenLine, List, Store, Sparkles } from "lucide-react";
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

  // If rawInput matches an existing UUID in options
  const matchById = existingOptions.find((o) => o.value === trimmed);
  if (matchById) return matchById.value;

  // If rawInput matches an existing merchant name (case-insensitive)
  const matchByName = existingOptions.find(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchByName) return matchByName.value;

  // Otherwise, create a new record in merchants table
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("merchants")
      .insert({
        name: trimmed,
        source: "manual_input",
      })
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
  const { t, language } = useLanguage();
  const [options, setOptions] = useState<MerchantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const [manualText, setManualText] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("merchants")
      .select("id, name")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        const opts = (data ?? []).map((m: any) => ({ value: m.id, label: m.name }));
        setOptions(opts);
        setLoading(false);

        // If initial value exists but is not an existing ID, switch to manual mode
        if (value && !opts.some((o) => o.value === value)) {
          setIsManual(true);
          setManualText(value);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleToggleMode() {
    if (isManual) {
      // Switching back to select mode
      setIsManual(false);
      onChange("");
    } else {
      // Switching to manual typing mode
      setIsManual(true);
      setManualText("");
      onChange("");
    }
  }

  function handleManualChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setManualText(val);
    // Pass raw string prefixed with `manual:` so submit handler knows to resolve or insert
    onChange(val ? `manual:${val}` : "");
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <Label className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-accent" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <button
          type="button"
          onClick={handleToggleMode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors"
        >
          {isManual ? (
            <>
              <List className="h-3 w-3" />
              {t("merchant_toggle_select")}
            </>
          ) : (
            <>
              <PenLine className="h-3 w-3" />
              {t("merchant_toggle_manual")}
            </>
          )}
        </button>
      </div>

      {isManual ? (
        <div className="relative">
          <Input
            type="text"
            required={required}
            placeholder={t("merchant_placeholder_manual")}
            value={manualText}
            onChange={handleManualChange}
            className="border-accent/40 focus:border-accent pr-24"
          />
          <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            <Sparkles className="h-2.5 w-2.5" /> {t("merchant_new_tag")}
          </span>
        </div>
      ) : (
        <Select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            {loading ? t("loading") : language === "id" ? "Pilih merchant..." : "Select merchant..."}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
