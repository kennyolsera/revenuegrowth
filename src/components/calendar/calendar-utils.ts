export function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toDateInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  demo: "bg-blue-50 text-accent border border-blue-200/60",
  onboarding: "bg-emerald-50 text-status-success border border-emerald-200/60",
  support: "bg-amber-50 text-amber-700 border border-amber-200/60",
  internal: "bg-slate-100 text-slate-700 border border-slate-200",
  lainnya: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
