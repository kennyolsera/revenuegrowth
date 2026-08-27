export function getMonthGrid(year: number, month: number): Date[] {
  // month: 0-11. Grid starts on Monday, always 6 rows (42 cells) for stable layout.
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Monday
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
  demo: "bg-accent-light text-accent",
  onboarding: "bg-emerald-50 text-status-success",
  support: "bg-amber-50 text-status-warning",
  internal: "bg-navy-soft text-navy-light",
  lainnya: "bg-slate-100 text-slate-600",
};

export const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
