import { cn } from "@/lib/utils";

type Tone = "draft" | "progress" | "success" | "danger" | "warning" | "neutral" | "info";

const toneClasses: Record<Tone, { badge: string; dot: string }> = {
  draft: {
    badge: "bg-slate-100/90 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  progress: {
    badge: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-500",
  },
  success: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  danger: {
    badge: "bg-rose-50 text-rose-700 border-rose-200/80",
    dot: "bg-rose-500",
  },
  warning: {
    badge: "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500",
  },
  neutral: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
  info: {
    badge: "bg-sky-50 text-sky-700 border-sky-200/80",
    dot: "bg-sky-500",
  },
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

export function StatusBadge({ status }: { status: string }) {
  const normalizedKey = status.toLowerCase().replaceAll(" ", "_");
  const tone = STATUS_TONE_MAP[normalizedKey] ?? "neutral";
  const label = status.replaceAll("_", " ");
  const style = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide shadow-xs",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-xs",
        style.badge
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      {children}
    </span>
  );
}
