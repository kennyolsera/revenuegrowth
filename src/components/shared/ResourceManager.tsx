"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { DataTable, type ColumnDef } from "./DataTable";
import { Toolbar, type FilterDef } from "./Toolbar";
import { SupabaseNotice, ErrorNotice, EmptyState } from "./SupabaseNotice";
import { PageHeader } from "./PageHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { MerchantSelectField, resolveMerchantId } from "./MerchantSelectField";

export interface FormFieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "select" | "merchant_select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2;
}

export interface ResourceManagerProps<T extends { id: string }> {
  table: string;
  title: string;
  description?: string;
  addLabel?: string;
  columns: ColumnDef<T>[];
  formFields: FormFieldDef[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  filters?: FilterDef[];
  defaultValues?: Record<string, any>;
  selectQuery?: string;
  orderBy?: string;
  ascending?: boolean;
  onBeforeSave?: (values: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>;
  disableDelete?: boolean;
  extraRowActions?: (row: T, refresh: () => void) => React.ReactNode;
}

/**
 * Strip nested objects / joins from a payload before sending to Supabase.
 * Supabase PostgREST rejects payloads that include joined relation objects
 * (e.g., { merchant: { name: "X" } }) — those come from selectQuery joins
 * but must never be written back.
 */
function sanitizePayload(values: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(values)) {
    // Skip nested objects (joined relations like merchant: { id, name })
    // Keep null, booleans, numbers, strings, and arrays (e.g., jsonb)
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      continue;
    }
    result[key] = val;
  }
  return result;
}

export function ResourceManager<T extends { id: string }>({
  table,
  title,
  description,
  addLabel,
  columns,
  formFields,
  searchKeys = [],
  searchPlaceholder,
  filters,
  defaultValues = {},
  selectQuery = "*",
  orderBy = "created_at",
  ascending = false,
  onBeforeSave,
  disableDelete,
  extraRowActions,
  extraHeaderAction,
  reloadSignal,
}: ResourceManagerProps<T> & { extraHeaderAction?: React.ReactNode; reloadSignal?: number }) {
  const { t, language } = useLanguage();
  const effectiveAddLabel = addLabel ?? t("add");
  const effectiveSearchPlaceholder = searchPlaceholder ?? t("search");

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const query = supabase.from(table).select(selectQuery).order(orderBy, { ascending });
      const { data, error } = await query;
      if (error) throw error;
      setRows((data as unknown as T[]) ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, [table, reloadSignal]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        searchKeys.some((key) => String((row as any)[key] ?? "").toLowerCase().includes(search.toLowerCase()));
      const matchesFilters = Object.entries(filterValues).every(
        ([key, value]) => !value || String((row as any)[key]) === value
      );
      return matchesSearch && matchesFilters;
    });
  }, [rows, search, filterValues, searchKeys]);

  function openCreate() {
    setEditing(null);
    setFormValues({ ...defaultValues });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    // Only populate form with fields that correspond to actual form fields (strip joins)
    const fieldKeys = formFields.map((f) => f.key);
    const cleanFormValues: Record<string, any> = {};
    fieldKeys.forEach((key) => {
      cleanFormValues[key] = (row as any)[key] ?? defaultValues[key] ?? "";
    });
    setFormValues(cleanFormValues);
    setFormError(null);
    setDialogOpen(true);
  }

  async function logActivity(action: string, recordId?: string, oldVal?: any, newVal?: any) {
    try {
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        table_name: table,
        record_id: recordId || null,
        action,
        changed_by: userRes.user?.email || "System",
        old_value: oldVal || null,
        new_value: newVal || null,
      });
    } catch {
      // Non-blocking audit log
    }
  }

  async function handleDelete(row: T) {
    if (!confirm(t("confirm_delete"))) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) {
      alert(`${t("delete_error")}: ${error.message}`);
      return;
    }
    await logActivity("DELETE", row.id, sanitizePayload(row as any));
    fetchRows();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const supabase = createClient();
      const currentValues = { ...formValues };

      // Resolve merchant_id if user typed manually
      for (const f of formFields) {
        if (f.type === "merchant_select" || f.key === "merchant_id") {
          const rawVal = currentValues[f.key];
          if (typeof rawVal === "string" && rawVal.startsWith("manual:")) {
            const rawName = rawVal.replace("manual:", "");
            const resolvedId = await resolveMerchantId(rawName, f.options ?? []);
            if (!resolvedId) {
              throw new Error(`Failed to create new merchant: "${rawName}"`);
            }
            currentValues[f.key] = resolvedId;
          }
        }
      }

      // Sanitize payload — remove any nested join objects
      const sanitized = sanitizePayload(currentValues);
      const payload = onBeforeSave ? await onBeforeSave(sanitized) : sanitized;

      if (editing) {
        const { error } = await supabase.from(table).update(payload).eq("id", editing.id);
        if (error) throw error;
        await logActivity("UPDATE", editing.id, sanitizePayload(editing as any), payload);
      } else {
        const { data: inserted, error } = await supabase.from(table).insert(payload).select().single();
        if (error) throw error;
        await logActivity("CREATE", inserted?.id, null, payload);
      }
      setDialogOpen(false);
      fetchRows();
    } catch (err: any) {
      setFormError(err?.message ?? t("save_error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-2.5">
            {extraHeaderAction}
            <Button onClick={openCreate} size="sm" variant="accent">
              <Plus className="h-4 w-4" /> {effectiveAddLabel}
            </Button>
          </div>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={effectiveSearchPlaceholder}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 py-16 shadow-sm">
          <EmptyState text={t("loading")} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredRows}
          emptyText={t("no_data")}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              {extraRowActions?.(row, fetchRows)}
              <button
                onClick={() => openEdit(row)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent"
                title={t("edit")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {!disableDelete && (
                <button
                  onClick={() => handleDelete(row)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-status-danger"
                  title={t("delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        />
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? `${t("edit")} — ${title}` : effectiveAddLabel}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {formFields.map((f) => (
              <div key={f.key} className={f.colSpan === 2 ? "sm:col-span-2" : undefined}>
                {f.type === "merchant_select" || f.key === "merchant_id" ? (
                  <Field>
                    <MerchantSelectField
                      label={f.label}
                      required={f.required}
                      value={formValues[f.key] ?? ""}
                      onChange={(val) => setFormValues((p) => ({ ...p, [f.key]: val }))}
                    />
                  </Field>
                ) : (
                  <Field>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={f.key}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formValues[f.key] ?? ""}
                        onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    ) : f.type === "select" ? (
                      <Select
                        id={f.key}
                        required={f.required}
                        value={formValues[f.key] ?? ""}
                        onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      >
                        <option value="" disabled>
                          {language === "id" ? `Pilih ${f.label.toLowerCase()}` : `Select ${f.label.toLowerCase()}`}
                        </option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id={f.key}
                        type={f.type ?? "text"}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formValues[f.key] ?? ""}
                        onChange={(e) => setFormValues((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    )}
                  </Field>
                )}
              </div>
            ))}
          </div>

          {formError && (
            <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-status-danger">
              {formError}
            </p>
          )}

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
