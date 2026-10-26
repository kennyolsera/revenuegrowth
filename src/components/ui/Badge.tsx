import { cn } from "@/lib/utils";

type Tone = "draft" | "progress" | "success" | "danger" | "warning" | "neutral" | "info";

// DESIGN.md › Badge: neutral fill + border, status lives in the 6px dot.
const NEUTRAL_BADGE = "bg-surface-2 text-text-2 border-border";
const toneClasses: Record<Tone, { badge: string; dot: string }> = {
  draft: { badge: NEUTRAL_BADGE, dot: "bg-slate-400" },
  progress: { badge: NEUTRAL_BADGE, dot: "bg-blue" },
  success: { badge: NEUTRAL_BADGE, dot: "bg-green" },
  danger: { badge: NEUTRAL_BADGE, dot: "bg-red" },
  warning: { badge: NEUTRAL_BADGE, dot: "bg-amber" },
  neutral: { badge: NEUTRAL_BADGE, dot: "bg-slate-500" },
  info: { badge: NEUTRAL_BADGE, dot: "bg-teal" },
};

const STATUS_TONE_MAP: Record<string, Tone> = {
  draft: "draft",
  diajukan: "progress",
  submitted: "progress",
  verifikasi: "warning",
  verification: "warning",
  review: "warning",
  dijadwalkan: "info",
  scheduled: "info",
  diproses: "progress",
  in_progress: "progress",
  diproses_partner: "info",
  ditugaskan: "info",
  assigned: "info",
  aktivasi: "progress",
  activation: "progress",
  menunggu_dokumen: "warning",
  waiting_docs: "warning",
  pending: "warning",
  bermasalah: "danger",
  issue: "danger",
  aktif: "success",
  active: "success",
  selesai: "success",
  completed: "success",
  disetujui: "success",
  approved: "success",
  disbursed: "success",
  dicairkan: "success",
  lunas: "success",
  paid: "success",
  terkirim: "info",
  sent: "info",
  ditolak: "danger",
  rejected: "danger",
  batal: "danger",
  cancelled: "danger",
  tidak_lanjut: "danger",
  siap_handover: "neutral",
  ready_handover: "neutral",
  baru: "info",
  new: "info",
  urgent: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
  demo: "info",
  onboarding: "success",
  support: "warning",
  internal: "neutral",
  lainnya: "draft",
};

/** Resolve a raw status string to its badge tone + color classes (shared with inline editors). */
export function statusTone(status: string) {
  const normalizedKey = status.toLowerCase().replaceAll(" ", "_");
  const tone = STATUS_TONE_MAP[normalizedKey] ?? "neutral";
  return toneClasses[tone];
}

export function StatusBadge({ status }: { status: string }) {
  const normalizedKey = status.toLowerCase().replaceAll(" ", "_");
  const tone = STATUS_TONE_MAP[normalizedKey] ?? "neutral";
  const label = status.replaceAll("_", " ");
  const style = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-xs border px-1.5 text-xs font-medium capitalize whitespace-nowrap",
        style.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}

export function Badge({
  tone = "neutral",
  showDot = false,
  children,
}: {
  tone?: Tone;
  showDot?: boolean;
  children: React.ReactNode;
}) {
  const style = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-xs border px-1.5 text-xs font-medium whitespace-nowrap",
        style.badge
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      {children}
    </span>
  );
}
