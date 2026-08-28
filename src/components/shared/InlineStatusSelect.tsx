"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { statusTone } from "@/components/ui/Badge";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";

/**
 * Editable status pill for a table row. Updates the record directly (no edit
 * dialog), writes an audit log, toasts on success, and asks the parent to
 * refresh. Styled to read like the StatusBadge it replaces.
 */
export function InlineStatusSelect({
  table,
  row,
  options,
  field = "status",
  onChanged,
}: {
  table: string;
  row: { id: string; [key: string]: any };
  options: { value: string; label: string }[];
  field?: string;
  onChanged?: () => void;
}) {
  const { t } = useLanguage();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const current = row[field] as string;
  const style = statusTone(current);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === current) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).update({ [field]: next }).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    // Best-effort audit log (non-blocking)
    try {
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        table_name: table,
        record_id: row.id,
        action: "UPDATE",
        changed_by: userRes.user?.email || "System",
        old_value: { [field]: current },
        new_value: { [field]: next },
      });
    } catch {
      /* ignore */
    }
    setSaving(false);
    toast.success(t("toast_status_updated"));
    onChanged?.();
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border pl-2.5 pr-6 py-0.5 text-xs font-semibold capitalize shadow-xs transition-colors focus-within:ring-2 focus-within:ring-accent/30",
        style.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      <select
        value={current}
        onChange={handleChange}
        disabled={saving}
        aria-label={t("toast_status_updated")}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer appearance-none bg-transparent pr-1 capitalize focus:outline-none disabled:cursor-wait"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white capitalize text-slate-700">
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
      </span>
    </div>
  );
}
