"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ptSend, usePtNav, type PtSettings } from "@/lib/pt-bridge";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import { cn } from "@/lib/utils";

type PrefKey = keyof PtSettings["prefs"];
type NotifKey = keyof PtSettings["notif"];

function Section({ id, title, desc, children }: { id?: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 rounded-lg border border-border bg-surface">
      <header className="border-b border-border px-5 py-3.5">
        <h2 className="text-[14px] font-semibold text-text">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-text-3">{desc}</p>}
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-text">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-text-3">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", on ? "bg-accent" : "bg-surface-3")}
    >
      <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

const selectCls =
  "h-8 min-w-[180px] rounded-md border border-border bg-bg px-2 text-[13px] text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function SettingsPage() {
  const nav = usePtNav();
  const s = nav?.settings;
  const { language } = useLanguage();
  const toast = useToast();
  const id = language === "id";
  const L = (a: string, b: string) => (id ? a : b);
  const [wsName, setWsName] = useState("");

  useEffect(() => {
    if (s) setWsName(s.wsName);
  }, [s?.wsName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Make sure Project Timeline is loaded (it normally preloads in the background).
  useEffect(() => {
    if (!nav) ptSend({ type: "noop" });
  }, [nav]);

  const setPref = (k: PrefKey, v: string | boolean, label: string) => {
    ptSend({ type: "set-pref", k, v });
    toast.success(L(`${label} disimpan`, `${label} saved`));
  };
  const setNotif = (k: NotifKey, v: boolean, label: string) => {
    ptSend({ type: "set-notif-pref", k, v });
    toast.success(v ? L(`Notifikasi ${label} aktif`, `${label} notifications on`) : L(`Notifikasi ${label} dimatikan`, `${label} notifications off`));
  };
  const saveName = () => {
    const name = wsName.trim();
    if (!s || !name || name === s.wsName) return;
    ptSend({ type: "set-ws-name", name });
    toast.success(L(`Nama workspace diubah ke "${name}"`, `Workspace renamed to "${name}"`));
  };

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
      <PageHeader title={L("Pengaturan", "Settings")} description={L("Pengaturan dashboard dan Project Timeline di satu tempat.", "Dashboard and Project Timeline settings in one place.")} />

      {!s ? (
        <div className="rounded-lg border border-border bg-surface px-5 py-8 text-center text-[13px] text-text-3" role="status">
          {L("Memuat pengaturan Project Timeline...", "Loading Project Timeline settings...")}
        </div>
      ) : (
        <>
          <Section
            id="notifications"
            title={L("Notifikasi saya", "My notifications")}
            desc={L("Muncul di lonceng di bagian atas. Hanya berlaku untuk akun Anda.", "Shown in the bell at the top. Applies to your account only.")}
          >
            <Row label={L("Saat disebut (@nama)", "When someone @mentions me")}>
              <Toggle label="Mentions" on={s.notif.mention} onChange={(v) => setNotif("mention", v, L("sebutan", "Mention"))} />
            </Row>
            <Row label={L("Saat ditugaskan ke tugas", "When I'm assigned a task")}>
              <Toggle label="Assignments" on={s.notif.assign} onChange={(v) => setNotif("assign", v, L("penugasan", "Assignment"))} />
            </Row>
            <Row
              label={L("Komentar di tugas saya", "Comments on my tasks")}
              hint={L("Tugas yang ditugaskan ke Anda atau yang pernah Anda komentari.", "Tasks assigned to you or that you've commented on.")}
            >
              <Toggle label="Comments" on={s.notif.comment} onChange={(v) => setNotif("comment", v, L("komentar", "Comment"))} />
            </Row>
          </Section>

          <Section
            id="project-timeline"
            title="Project Timeline"
            desc={L("Nama workspace berlaku untuk seluruh tim. Pengaturan lain hanya untuk Anda di browser ini.", "The workspace name is shared by the team. Everything else applies to you in this browser.")}
          >
            <Row label={L("Nama workspace", "Workspace name")}>
              <input
                value={wsName}
                maxLength={60}
                onChange={(e) => setWsName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                aria-label={L("Nama workspace", "Workspace name")}
                className={cn(selectCls, "w-[220px]")}
              />
            </Row>
            <Row label={L("Halaman awal", "Start page")}>
              <select className={selectCls} value={s.prefs.home} onChange={(e) => setPref("home", e.target.value, L("Halaman awal", "Start page"))}>
                <option value="home">Home</option>
                <option value="mytasks">My tasks</option>
                <option value="inbox">Inbox</option>
              </select>
            </Row>
            <Row label={L("Buka tugas di", "Open tasks in")}>
              <select className={selectCls} value={s.prefs.openTasks} onChange={(e) => setPref("openTasks", e.target.value, L("Cara membuka tugas", "Task opening"))}>
                <option value="drawer">{L("Panel samping", "Side panel")}</option>
                <option value="full">{L("Halaman penuh", "Full page")}</option>
              </select>
            </Row>
            <Row label={L("Konfirmasi sebelum menghapus", "Confirm before deleting")}>
              <Toggle label="Confirm before deleting" on={s.prefs.confirmDel} onChange={(v) => setPref("confirmDel", v, L("Konfirmasi hapus", "Delete confirmation"))} />
            </Row>
            <Row label={L("Tampilkan tugas selesai di Board", "Show completed tasks on boards")}>
              <Toggle label="Show completed on boards" on={s.prefs.showDoneBoard} onChange={(v) => setPref("showDoneBoard", v, L("Tampilan Board", "Board view"))} />
            </Row>
          </Section>

          <Section id="dates" title={L("Tanggal dan waktu", "Dates and time")}>
            <Row label={L("Minggu dimulai pada", "Week starts on")}>
              <select className={selectCls} value={s.prefs.weekStart} onChange={(e) => setPref("weekStart", e.target.value, L("Awal minggu", "Week start"))}>
                <option value="1">{L("Senin", "Monday")}</option>
                <option value="0">{L("Minggu", "Sunday")}</option>
                <option value="6">{L("Sabtu", "Saturday")}</option>
              </select>
            </Row>
            <Row label={L("Format tanggal", "Date format")}>
              <select className={selectCls} value={s.prefs.dateFmt} onChange={(e) => setPref("dateFmt", e.target.value, L("Format tanggal", "Date format"))}>
                <option value="MMM d">Oct 29</option>
                <option value="d/M">29/10</option>
                <option value="M/d">10/29</option>
                <option value="yyyy-MM-dd">2026-10-29</option>
              </select>
            </Row>
            <Row label={L("Format waktu", "Time format")}>
              <select className={selectCls} value={s.prefs.timeFmt} onChange={(e) => setPref("timeFmt", e.target.value, L("Format waktu", "Time format"))}>
                <option value="12">{L("12 jam (2:30 PM)", "12-hour (2:30 PM)")}</option>
                <option value="24">{L("24 jam (14:30)", "24-hour (14:30)")}</option>
              </select>
            </Row>
          </Section>
        </>
      )}
    </div>
  );
}
