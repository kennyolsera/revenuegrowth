"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { MODULE_OPTIONS, todayISO } from "@/lib/kanban";
import { PROJECT_STATUSES, addMonths } from "@/lib/kanban-projects";
import type { KanbanProject, KanbanProjectStatus } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

type Form = {
  name: string;
  description: string;
  owner: string;
  module: string;
  start_date: string;
  end_date: string;
  status: KanbanProjectStatus;
};

function emptyForm(): Form {
  const start = todayISO();
  return {
    name: "",
    description: "",
    owner: "",
    module: "internal",
    start_date: start,
    end_date: addMonths(start, 1),
    status: "active",
  };
}

export function ProjectDialog({
  open,
  project,
  assignees,
  onClose,
  onSaved,
}: {
  open: boolean;
  project: KanbanProject | null;
  /** Known PIC names, offered as suggestions for the owner field. */
  assignees: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setConfirmDelete(false);
    setForm(
      project
        ? {
            name: project.name,
            description: project.description ?? "",
            owner: project.owner ?? "",
            module: project.module,
            start_date: project.start_date,
            end_date: project.end_date,
            status: project.status,
          }
        : emptyForm()
    );
  }, [open, project]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setError(null);
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError(t("proj_err_name"));
    if (!form.start_date || !form.end_date) return setError(t("proj_err_dates"));
    if (form.end_date < form.start_date) return setError(t("proj_err_end_before_start"));
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      owner: form.owner.trim() || null,
      module: form.module,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    };
    const result = project
      ? await supabase.from("kanban_projects").update(payload).eq("id", project.id)
      : await supabase
          .from("kanban_projects")
          .insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.email ?? null });
    setSaving(false);
    if (result.error) return setError(`${t("save_error")}: ${result.error.message}`);
    toast.success(project ? t("proj_toast_updated").replace("{name}", payload.name) : t("proj_toast_created").replace("{name}", payload.name));
    onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!project) return;
    setSaving(true);
    const { error } = await createClient().from("kanban_projects").delete().eq("id", project.id);
    setSaving(false);
    if (error) return setError(`${t("save_error")}: ${error.message}`);
    toast.success(t("proj_toast_deleted").replace("{name}", project.name));
    onSaved();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={project ? t("proj_edit") : t("proj_new")}
      description={t("proj_dialog_desc")}
      width="max-w-xl"
    >
      <form onSubmit={handleSave} noValidate>
        <Field>
          <Label htmlFor="proj-name">{t("proj_name")}</Label>
          <Input
            id="proj-name"
            value={form.name}
            maxLength={160}
            autoFocus
            placeholder={language === "id" ? "mis. Onboarding partner Bank X" : "e.g. Bank X partner onboarding"}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="proj-owner">{t("proj_owner")}</Label>
            <Input id="proj-owner" list="proj-owner-options" value={form.owner} onChange={(e) => set("owner", e.target.value)} />
            <datalist id="proj-owner-options">
              {assignees.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
          <Field>
            <Label htmlFor="proj-module">{t("proj_module")}</Label>
            <Select id="proj-module" value={form.module} onChange={(e) => set("module", e.target.value)}>
              {MODULE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label[language]}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="proj-start">{t("proj_start")}</Label>
            <Input id="proj-start" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="proj-end">{t("proj_end")}</Label>
            <Input id="proj-end" type="date" min={form.start_date} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="proj-status">{t("proj_status")}</Label>
            <Select id="proj-status" value={form.status} onChange={(e) => set("status", e.target.value as KanbanProjectStatus)}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label[language]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field>
          <Label htmlFor="proj-desc">{t("proj_description")}</Label>
          <Textarea id="proj-desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        {error && (
          <p role="alert" className="mb-3 text-xs text-red">
            {error}
          </p>
        )}

        {confirmDelete && project && (
          <div role="alert" className="mb-3 rounded-md border border-border bg-surface-2 p-3 text-xs text-text-2">
            <p>{t("proj_delete_confirm").replace("{name}", project.name)}</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" variant="danger" loading={saving} onClick={handleDelete}>
                {t("proj_delete_yes")}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-divider pt-4">
          {project ? (
            <Button type="button" variant="ghost" size="sm" className="text-red" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> {t("proj_delete")}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={saving}>
              {project ? t("save") : t("proj_create")}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
