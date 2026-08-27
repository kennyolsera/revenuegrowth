"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, NotebookPen, Plus, Calendar as CalendarIcon } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import { useMerchantOptions } from "@/lib/hooks/useMerchantOptions";
import { MerchantSelectField, resolveMerchantId } from "@/components/shared/MerchantSelectField";
import { EVENT_TYPE_COLORS, getMonthGrid, isSameDay, toDateInputValue } from "@/components/calendar/calendar-utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm = {
  title: "",
  event_type: "demo",
  date: "",
  start_time: "09:00",
  end_time: "10:00",
  merchant_id: "",
  organizer: "",
  attendees: "",
  meeting_link: "",
  notes: "",
};

export default function CalendarPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const merchantOptions = useMerchantOptions();

  const EVENT_TYPES = [
    { value: "demo", label: "Demo" },
    { value: "onboarding", label: "Onboarding" },
    { value: "support", label: "Support" },
    { value: "internal", label: language === "id" ? "Internal" : "Internal Briefing" },
    { value: "lainnya", label: language === "id" ? "Lainnya" : "Other" },
  ];

  const monthNames = language === "id" ? MONTH_NAMES_ID : MONTH_NAMES_EN;
  const dayLabels = language === "id" ? DAY_LABELS_ID : DAY_LABELS_EN;

  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const grid = useMemo(() => getMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const rangeStart = grid[0];
      const rangeEnd = grid[grid.length - 1];
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*, merchant:merchants(name)")
        .gte("start_time", rangeStart.toISOString())
        .lte("start_time", rangeEnd.toISOString())
        .order("start_time", { ascending: true });
      if (error) throw error;
      setEvents(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Error loading events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [cursor]);

  function openCreateAt(date: Date) {
    setEditingId(null);
    setForm({ ...emptyForm, date: toDateInputValue(date) });
    setDialogOpen(true);
  }

  function openEdit(ev: any) {
    const start = new Date(ev.start_time);
    const end = new Date(ev.end_time);
    const pad = (n: number) => String(n).padStart(2, "0");
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      event_type: ev.event_type,
      date: toDateInputValue(start),
      start_time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      end_time: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      merchant_id: ev.merchant_id ?? "",
      organizer: ev.organizer ?? "",
      attendees: ev.attendees ?? "",
      meeting_link: ev.meeting_link ?? "",
      notes: ev.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      let resolvedMerchantId = form.merchant_id;

      if (typeof resolvedMerchantId === "string" && resolvedMerchantId.startsWith("manual:")) {
        const rawName = resolvedMerchantId.replace("manual:", "");
        resolvedMerchantId = (await resolveMerchantId(rawName, merchantOptions)) || "";
      }

      const start_time = new Date(`${form.date}T${form.start_time}:00`).toISOString();
      const end_time = new Date(`${form.date}T${form.end_time}:00`).toISOString();
      const payload = {
        title: form.title,
        event_type: form.event_type,
        start_time,
        end_time,
        merchant_id: resolvedMerchantId || null,
        organizer: form.organizer || null,
        attendees: form.attendees || null,
        meeting_link: form.meeting_link || null,
        notes: form.notes || null,
      };
      const query = editingId
        ? supabase.from("calendar_events").update(payload).eq("id", editingId)
        : supabase.from("calendar_events").insert(payload);
      const { error } = await query;
      if (error) throw error;
      setDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      alert(`Gagal menyimpan jadwal: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId || !confirm(t("confirm_delete"))) return;
    const supabase = createClient();
    await supabase.from("calendar_events").delete().eq("id", editingId);
    setDialogOpen(false);
    fetchEvents();
  }

  function goToMom() {
    if (!editingId) return;
    router.push(`/mom?event_id=${editingId}&title=${encodeURIComponent(form.title)}&merchant_id=${form.merchant_id}`);
  }

  const today = new Date();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("cal_title")}
        description={t("cal_desc")}
        action={
          <Button size="sm" variant="accent" onClick={() => openCreateAt(new Date())}>
            <Plus className="h-4 w-4" /> {t("cal_add")}
          </Button>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-3.5 shadow-sm">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-accent" />
          <span className="text-base font-bold tracking-tight text-slate-900">
            {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
        </div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
          {dayLabels.map((d) => (
            <div key={d} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day, idx) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.start_time), day));
            const inMonth = day.getMonth() === cursor.getMonth();
            const isToday = isSameDay(day, today);
            return (
              <div
                key={idx}
                onClick={() => openCreateAt(day)}
                className={cn(
                  "min-h-[105px] cursor-pointer border-b border-r border-slate-100 p-2 transition-colors hover:bg-blue-50/40",
                  !inMonth && "bg-slate-50/50 text-slate-300",
                  isToday && "bg-blue-50/20"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      isToday
                        ? "bg-accent text-white shadow-sm shadow-accent/40 font-bold"
                        : "text-slate-700"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(ev);
                      }}
                      className={cn(
                        "block w-full truncate rounded-lg px-2 py-0.5 text-left text-[11px] font-semibold transition-transform hover:scale-[1.02] shadow-2xs",
                        EVENT_TYPE_COLORS[ev.event_type]
                      )}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] font-medium text-slate-400 pl-1">
                      +{dayEvents.length - 3} {language === "id" ? "lainnya" : "more"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? (language === "id" ? "Detail Jadwal" : "Schedule Details") : t("cal_add")}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit}>
          <Field>
            <Label>{language === "id" ? "Judul Agenda" : "Agenda Title"}</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={language === "id" ? "mis. Demo Online Order Merchant X" : "e.g. Online Order Demo for Merchant X"}
            />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field>
              <Label>{language === "id" ? "Tipe Aktivitas" : "Activity Type"}</Label>
              <Select value={form.event_type} onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))}>
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <MerchantSelectField
                label={language === "id" ? "Merchant Terkait" : "Associated Merchant"}
                value={form.merchant_id}
                onChange={(val) => setForm((p) => ({ ...p, merchant_id: val }))}
              />
            </Field>
            <Field>
              <Label>{language === "id" ? "Tanggal" : "Date"}</Label>
              <Input type="date" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </Field>
            <Field>
              <Label>{language === "id" ? "Waktu" : "Time Window"}</Label>
              <div className="flex items-center gap-2">
                <Input type="time" required value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} />
                <span className="text-slate-400">–</span>
                <Input type="time" required value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} />
              </div>
            </Field>
            <Field>
              <Label>Organizer / Host</Label>
              <Input value={form.organizer} onChange={(e) => setForm((p) => ({ ...p, organizer: e.target.value }))} placeholder="Nama PIC" />
            </Field>
            <Field>
              <Label>{language === "id" ? "Tautan Online Meeting" : "Online Meeting Link"}</Label>
              <Input value={form.meeting_link} onChange={(e) => setForm((p) => ({ ...p, meeting_link: e.target.value }))} placeholder="https://meet.google.com/..." />
            </Field>
          </div>
          <Field>
            <Label>{language === "id" ? "Peserta (Internal & Eksternal)" : "Attendees (Internal & External)"}</Label>
            <Input value={form.attendees} onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))} placeholder="alex@domain.com, bobi@partner.com" />
          </Field>
          <Field>
            <Label>{language === "id" ? "Catatan / Agenda Pokok" : "Notes / Discussion Topics"}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            {editingId && (
              <>
                <Button type="button" variant="ghost" onClick={goToMom} className="mr-auto text-accent">
                  <NotebookPen className="h-4 w-4" /> {language === "id" ? "Buat MOM" : "Create MOM"}
                </Button>
                <Button type="button" variant="danger" onClick={handleDelete}>
                  {t("delete")}
                </Button>
              </>
            )}
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
