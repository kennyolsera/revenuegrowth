/** Formatting helpers — all output in id-ID (titik ribuan, koma desimal). */

const LOCALE = 'id-ID';

const idrFull = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/**
 * formatIDR(1250000)                    → "Rp 1.250.000"
 * formatIDR(1250000, { compact: true }) → "Rp 1,25 jt"
 * formatIDR(3400000000, { compact: true }) → "Rp 3,4 M"
 */
export function formatIDR(value: number | null | undefined, opts: { compact?: boolean } = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!opts.compact) return idrFull.format(value).replace(/ /g, ' ');

  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  const units: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'M'],
    [1e6, 'jt'],
    [1e3, 'rb'],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      const n = abs / size;
      const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2;
      const text = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(n);
      return `${sign}Rp ${text} ${suffix}`;
    }
  }
  return `${sign}Rp ${new Intl.NumberFormat(LOCALE).format(abs)}`;
}

/** formatNumber(12480) → "12.480" */
export function formatNumber(value: number | null | undefined, maximumFractionDigits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

/** formatPercent(0.124) → "12,4%" — input is a ratio, not a percentage. */
export function formatPercent(ratio: number | null | undefined, maximumFractionDigits = 1): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return '—';
  return new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits }).format(ratio);
}

type DateInput = Date | string | number;
const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d));

/**
 * formatDate(d)            → "26 Okt 2026"   (tables)
 * formatDate(d, 'long')    → "Senin, 26 Oktober 2026" (headers)
 * formatDate(d, 'time')    → "14.30"
 */
export function formatDate(d: DateInput | null | undefined, style: 'short' | 'long' | 'time' = 'short'): string {
  if (d === null || d === undefined) return '—';
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return '—';
  if (style === 'long') {
    return new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }
  if (style === 'time') {
    return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(date)
    .replace('.', '');
}

/** Relative time for activity feeds only: "2 hari lalu", "baru saja". */
export function formatRelative(d: DateInput, now: Date = new Date()): string {
  const diffSec = Math.round((toDate(d).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'baru saja';
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
  ];
  let unit: Intl.RelativeTimeFormatUnit = 'year';
  let divisor = 31557600;
  for (let i = 0; i < steps.length; i++) {
    if (abs < steps[i][0]) {
      unit = steps[i][1];
      divisor = i === 0 ? 1 : steps[i - 1][0];
      break;
    }
  }
  return rtf.format(Math.round(diffSec / divisor), unit);
}

/** Time-of-day greeting for the dashboard header. */
export function greeting(name: string, now: Date = new Date()): string {
  const h = now.getHours();
  const part = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
  return `Selamat ${part}, ${name}`;
}
