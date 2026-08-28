"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CurrencyInput, Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { DataTable, type ColumnDef } from "./DataTable";
import { Toolbar, type FilterDef } from "./Toolbar";
import { SupabaseNotice, ErrorNotice, EmptyState } from "./SupabaseNotice";
import { PageHeader } from "./PageHeader";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { MerchantSelectField, resolveMerchantId } from "./MerchantSelectField";

export interface FormFieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "currency" | "date" | "datetime-local" | "select" | "merchant_select";
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
  const toast = useToast();
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
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  function requestDelete(row: T) {
    setDeleteError(null);
    setDeleteTarget(row);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
    if (error) {
      setDeleteError(`${t("delete_error")}: ${error.message}`);
      setDeleting(false);
      return;
    }
    await logActivity("DELETE", deleteTarget.id, sanitizePayload(deleteTarget as any));
    setDeleting(false);
    setDeleteTarget(null);
    toast.success(t("toast_deleted"));
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
        // Coerce numeric fields: empty → null, otherwise a real number
        if (f.type === "currency" || f.type === "number") {
          const v = currentValues[f.key];
          if (v === "" || v === null || v === undefined) {
            currentValues[f.key] = null;
          } else {
            const n = Number(String(v).replace(/\D/g, ""));
            currentValues[f.key] = Number.isNaN(n) ? null : n;
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
        toast.success(t("toast_updated"));
      } else {
        const { data: inserted, error } = await supabase.from(table).insert(payload).select().single();
        if (error) throw error;
        await logActivity("CREATE", inserted?.id, null, payload);
        toast.success(t("toast_created"));
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
        <div className="rounded-lg border border-surface-border bg-surface py-16 shadow-xs">
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
                className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title={t("edit")}
                aria-label={t("edit")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {!disableDelete && (
                <button
                  onClick={() => requestDelete(row)}
                  className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-status-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger/40"
                  title={t("delete")}
                  aria-label={t("delete")}
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
                    ) : f.type === "currency" ? (
                      <CurrencyInput
                        id={f.key}
                        required={f.required}
                        value={formValues[f.key] ?? ""}
                        onChange={(digits) => setFormValues((p) => ({ ...p, [f.key]: digits }))}
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

      <Dialog
        open={deleteTarget !== null}
        onClose={() => (deleting ? undefined : setDeleteTarget(null))}
        title={t("confirm_delete_title")}
        width="max-w-md"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-status-danger">
            <Trash2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{t("confirm_delete")}</p>
        </div>

        {deleteError && (
          <p className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-status-danger">
            {deleteError}
          </p>
        )}

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-5">
          <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="danger" loading={deleting} onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
