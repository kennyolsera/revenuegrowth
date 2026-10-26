/**
 * Status → label + colour, in one place.
 * Components never pick status colours themselves.
 *
 * IMPORTANT: the keys below are the PROPOSED values from DESIGN.md.
 * Before shipping, align each key with the enum/check values in supabase/schema.sql.
 */

export type Tone = 'gray' | 'blue' | 'amber' | 'green' | 'red' | 'teal' | 'violet' | 'accent';

export interface StatusDef {
  label: string;
  tone: Tone;
}

export const PIPELINE_STATUS = {
  lead: { label: 'Lead', tone: 'gray' },
  contacted: { label: 'Dihubungi', tone: 'blue' },
  in_progress: { label: 'Proses / Demo', tone: 'amber' },
  onboarded: { label: 'Onboarded', tone: 'green' },
  cancelled: { label: 'Batal', tone: 'red' },
} as const satisfies Record<string, StatusDef>;

export const MERCHANT_STATUS = {
  onboarding: { label: 'Onboarding', tone: 'amber' },
  active: { label: 'Aktif', tone: 'green' },
  inactive: { label: 'Tidak aktif', tone: 'gray' },
  suspended: { label: 'Suspend', tone: 'red' },
} as const satisfies Record<string, StatusDef>;

export const CLAIM_STATUS = {
  draft: { label: 'Draft', tone: 'gray' },
  submitted: { label: 'Diajukan', tone: 'blue' },
  in_review: { label: 'Direview', tone: 'amber' },
  approved: { label: 'Disetujui', tone: 'green' },
  paid: { label: 'Dibayar', tone: 'teal' },
  rejected: { label: 'Ditolak', tone: 'red' },
} as const satisfies Record<string, StatusDef>;

export const REQUEST_STATUS = {
  new: { label: 'Baru', tone: 'blue' },
  in_progress: { label: 'Diproses', tone: 'amber' },
  done: { label: 'Selesai', tone: 'green' },
  rejected: { label: 'Ditolak', tone: 'red' },
} as const satisfies Record<string, StatusDef>;

export const ROLE_STATUS = {
  super_admin: { label: 'Super Admin', tone: 'violet' },
  head_rg: { label: 'Head of RG', tone: 'accent' },
  team_rg: { label: 'Tim RG Internal', tone: 'blue' },
  external_team: { label: 'Tim Eksternal', tone: 'teal' },
  finance_ops: { label: 'Finance/Ops', tone: 'amber' },
} as const satisfies Record<string, StatusDef>;

export type PipelineStatus = keyof typeof PIPELINE_STATUS;
export type MerchantStatus = keyof typeof MERCHANT_STATUS;
export type ClaimStatus = keyof typeof CLAIM_STATUS;
export type RequestStatus = keyof typeof REQUEST_STATUS;
export type Role = keyof typeof ROLE_STATUS;

/** Look up a status safely; unknown values render as a gray badge with the raw value. */
export function resolveStatus(map: Record<string, StatusDef>, key: string | null | undefined): StatusDef {
  if (!key) return { label: '—', tone: 'gray' };
  return map[key] ?? { label: key, tone: 'gray' };
}

/** Target vs actual: ≥100% green, 80–99% amber, <80% red. */
export function targetTone(ratio: number): Tone {
  if (ratio >= 1) return 'green';
  if (ratio >= 0.8) return 'amber';
  return 'red';
}

/** CSS variable for a tone — for dots, glyphs, chart marks. */
export const toneVar = (tone: Tone) => `var(--${tone})`;

/** Text-colour class for a tone (used for overdue, target captions). */
export const toneText: Record<Tone, string> = {
  gray: 'text-text-3',
  blue: 'text-blue',
  amber: 'text-amber',
  green: 'text-green',
  red: 'text-red',
  teal: 'text-teal',
  violet: 'text-violet',
  accent: 'text-accent',
};

/** Fixed series order for charts — same series keeps the same colour everywhere. */
export const CHART_SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'] as const;
export const CHART_MUTED = 'var(--chart-muted)';
