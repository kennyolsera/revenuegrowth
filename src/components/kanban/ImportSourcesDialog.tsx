"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Loader2, NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge } from "@/components/ui/Badge";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { cn, formatDate } from "@/lib/utils";

interface Candidate {
  key: string;
  source_type: "mom" | "request";
  source_id: string;
  source_ref: number | null;
  title: string;
  context: string;
  assignee: string | null;
  due_date: string | null;
  priority: string;
  merchant_partner: string | null;
  description: string | null;
}

const sourceKey = (type: string, id: string, ref: number | null) => `${type}:${id}:${ref ?? -1}`;

/**
 * Intake step of the flow: pulls open MOM action items and new Request Form
 * tickets onto the board. MOM items already carry a PIC + due date, so they
 * land in To Do; requests need triage, so they land in Backlog.
 */
export function ImportSourcesDialog({
  open,
  onClose,
  onImported,
  topPosition,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  topPosition: (stage: "backlog" | "todo") => number;
}) {
  const { language } = useLanguage();
  const toast = useToast();
  const id = language === "id";

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open]);

  async function load() {
    setLoading(true);
    setSelected(new Set());
    const supabase = createClient();
    const [existingRes, momRes, reqRes] = await Promise.all([
      supabase.from("kanban_tasks").select("source_type, source_id, source_ref").neq("source_type", "manual"),
      supabase
        .from("meeting_minutes")
        .select("id, title, meeting_date, merchant_partner, action_items")
        .order("meeting_date", { ascending: false })
        .limit(60),
      supabase
        .from("requests")
        .select("id, title, description, requester_name, priority, assigned_pic, created_at, category:request_categories(name)")
        .in("status", ["baru", "ditugaskan"])
        .order("created_at", { ascending: false }),
    ]);

    const taken = new Set((existingRes.data ?? []).map((r: any) => sourceKey(r.source_type, r.source_id, r.source_ref)));
    const list: Candidate[] = [];

    for (const m of momRes.data ?? []) {
      ((m as any).action_items ?? []).forEach((a: any, idx: number) => {
        const key = sourceKey("mom", m.id, idx);
        if (a.done || !a.label?.trim() || taken.has(key)) return;
        list.push({
          key,
          source_type: "mom",
          source_id: m.id,
          source_ref: idx,
          title: a.label,
          context: `MOM · ${m.title} · ${formatDate(m.meeting_date)}`,
          assignee: a.pic || null,
          due_date: a.due_date || null,
          priority: "medium",
          merchant_partner: m.merchant_partner ?? null,
          description: id ? `Action item dari MOM "${m.title}"` : `Action item from MOM "${m.title}"`,
        });
      });
    }

    for (const r of reqRes.data ?? []) {
      const key = sourceKey("request", r.id, null);
      if (taken.has(key)) continue;
      list.push({
        key,
        source_type: "request",
        source_id: r.id,
        source_ref: null,
        title: r.title,
        context: `Request · ${(r as any).category?.name ?? "-"} · ${r.requester_name}`,
        assignee: r.assigned_pic ?? null,
        due_date: null,
        priority: r.priority,
        merchant_partner: null,
        description: r.description,
      });
    }

    setCandidates(list);
    setLoading(false);
  }

  const groups = useMemo(
    () => [
      { type: "mom" as const, icon: NotebookPen, title: id ? "Action Item MOM → To Do" : "MOM Action Items → To Do" },
      { type: "request" as const, icon: Inbox, title: id ? "Request Form → Backlog" : "Request Form → Backlog" },
    ],
    [id]
  );

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleImport() {
    const picks = candidates.filter((c) => selected.has(c.key));
    if (picks.length === 0) return;
    setImporting(true);
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    let todoPos = topPosition("todo");
    let backlogPos = topPosition("backlog");
    const rows = picks.map((c) => {
      // MOM items without a PIC cannot enter To Do (definition of ready) → Backlog.
      const stage = c.source_type === "mom" && c.assignee ? "todo" : "backlog";
      const position = stage === "todo" ? (todoPos -= 1000) : (backlogPos -= 1000);
      return {
        title: c.title,
        description: c.description,
        stage,
        priority: c.priority,
        module: c.source_type === "request" ? "request" : "internal",
        assignee: c.assignee,
        due_date: c.due_date,
        merchant_partner: c.merchant_partner,
        source_type: c.source_type,
        source_id: c.source_id,
        source_ref: c.source_ref,
        position,
        created_by: userRes.user?.email ?? null,
      };
    });
    const { error } = await supabase.from("kanban_tasks").insert(rows);
    setImporting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(id ? `${rows.length} kartu ditambahkan ke board` : `${rows.length} cards added to the board`);
    onImported();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={id ? "Tarik Pekerjaan ke Board" : "Pull Work onto the Board"}
      description={
        id
          ? "Pilih action item MOM yang belum selesai dan tiket Request Form baru. Item yang sudah ada di board tidak ditampilkan."
          : "Select open MOM action items and new Request Form tickets. Items already on the board are hidden."
      }
      width="max-w-2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-10 text-ink-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : candidates.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          {id ? "Semua action item & request sudah ada di board." : "Every action item & request is already on the board."}
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => {
            const items = candidates.filter((c) => c.source_type === g.type);
            if (items.length === 0) return null;
            const allOn = items.every((c) => selected.has(c.key));
            return (
              <section key={g.type}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    <g.icon className="h-3.5 w-3.5" /> {g.title} ({items.length})
                  </h4>
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent hover:underline"
                    onClick={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        items.forEach((c) => (allOn ? next.delete(c.key) : next.add(c.key)));
                        return next;
                      })
                    }
                  >
                    {allOn ? (id ? "Batal pilih" : "Clear") : id ? "Pilih semua" : "Select all"}
                  </button>
                </div>
                <ul className="divide-y divide-surface-border overflow-hidden rounded-xl border border-surface-border">
                  {items.map((c) => (
                    <li key={c.key}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors hover:bg-surface-muted",
                          selected.has(c.key) && "bg-accent-light"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(c.key)}
                          onChange={() => toggle(c.key)}
                          className="mt-0.5 h-4 w-4 accent-accent"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">{c.title}</p>
                          <p className="truncate text-xs text-ink-muted">{c.context}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-ink-muted">
                          <StatusBadge status={c.priority} />
                          {c.assignee && <span>PIC: {c.assignee}</span>}
                          {c.due_date && <span>{formatDate(c.due_date)}</span>}
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {id ? "Tutup" : "Close"}
        </Button>
        <Button type="button" variant="accent" onClick={handleImport} loading={importing} disabled={selected.size === 0}>
          {id ? `Tambahkan ${selected.size} kartu` : `Add ${selected.size} cards`}
        </Button>
      </div>
    </Dialog>
  );
}
