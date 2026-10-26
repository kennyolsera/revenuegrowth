'use client';

/**
 * Reference implementation of the Dashboard in the new design.
 * Uses SAMPLE DATA so the kit runs on its own — swap `sample` for the Supabase queries
 * from the v1.0 /dashboard page when merging.
 */
import * as React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Inbox, Plus } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { PageHeader, Segmented } from '@/components/ui/page-header';
import { StatStrip, Progress } from '@/components/ui/stat-strip';
import { Button } from '@/components/ui/button';
import { StatusBadge, Chip } from '@/components/ui/badge';
import { Table, THead, TH, TR, TD, MobileCardList, MobileCard } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/states';
import { ChartLegend, ChartTooltip, axisProps, cursorProps, gridProps, idrTick, lineProps } from '@/components/charts/chart-theme';
import { CLAIM_STATUS, CHART_SERIES, CHART_MUTED, targetTone } from '@/lib/status';
import { formatDate, formatIDR, formatPercent, greeting } from '@/lib/format';

const sample = {
  growth: [
    { week: 'M1', qris: 182_000_000, partner: 96_000_000, target: 250_000_000 },
    { week: 'M2', qris: 204_000_000, partner: 104_000_000, target: 260_000_000 },
    { week: 'M3', qris: 199_000_000, partner: 121_000_000, target: 270_000_000 },
    { week: 'M4', qris: 236_000_000, partner: 133_000_000, target: 280_000_000 },
    { week: 'M5', qris: 251_000_000, partner: 128_000_000, target: 290_000_000 },
    { week: 'M6', qris: 278_000_000, partner: 147_000_000, target: 300_000_000 },
  ],
  claims: [
    { id: 'KM-0142', merchant: 'Toko Sinar Jaya', owner: 'Rudi H.', amount: 1_250_000, status: 'in_review', date: '2026-10-24' },
    { id: 'KM-0141', merchant: 'Kopi Ampera', owner: 'Dewi S.', amount: 850_000, status: 'submitted', date: '2026-10-23' },
    { id: 'KM-0139', merchant: 'Pempek Bu Ani', owner: 'Rudi H.', amount: 2_400_000, status: 'approved', date: '2026-10-21' },
    { id: 'KM-0137', merchant: 'Apotek Sehat', owner: 'Fajar N.', amount: 600_000, status: 'rejected', date: '2026-10-20' },
    { id: 'KM-0136', merchant: 'Bengkel Maju', owner: 'Dewi S.', amount: 1_100_000, status: 'paid', date: '2026-10-18' },
  ],
  targets: [
    { label: 'QRIS', ratio: 0.93 },
    { label: 'Network Partner', ratio: 1.12 },
    { label: 'Online Order', ratio: 0.71 },
    { label: 'Financing Loan', ratio: 0.84 },
  ],
};

type Filter = 'all' | 'action' | 'mine';

export default function DashboardPage() {
  const [filter, setFilter] = React.useState<Filter>('all');
  const [selected, setSelected] = React.useState<string | null>(null);

  const claims = sample.claims.filter((c) =>
    filter === 'action' ? c.status === 'submitted' || c.status === 'in_review' : filter === 'mine' ? c.owner === 'Rudi H.' : true,
  );
  const needAction = sample.claims.filter((c) => c.status === 'submitted' || c.status === 'in_review').length;
  const now = new Date();

  return (
    <AppShell role="head_rg" userName="Kenny" crumbs={['Revenue Growth', 'Dashboard']}>
      <div className="page rise-in">
        <PageHeader
          title={greeting('Kenny', now)}
          sub={`${formatDate(now, 'long')} · ${needAction} klaim menunggu review`}
          actions={
            <>
              <Button variant="secondary" icon={<Download size={14} />}>Ekspor</Button>
              <Button variant="primary" icon={<Plus size={14} />}>Tambah akuisisi</Button>
            </>
          }
        />

        <StatStrip
          stats={[
            { label: 'Akuisisi bulan ini', value: '312', caption: '+18 · minggu ini', captionTone: 'green' },
            { label: 'Revenue VAS', value: formatIDR(1_284_500_000, { compact: true }), fullValue: formatIDR(1_284_500_000), caption: 'Naik 12% dari bulan lalu' },
            { label: 'Klaim menunggu', value: String(needAction), caption: `${needAction} · perlu review`, captionTone: 'amber' },
            { label: 'Konversi lead', value: formatPercent(0.274), caption: 'Target 30%' },
          ]}
        />

        <div className="mt-4 grid gap-4 min-[1101px]:grid-cols-[1.55fr_1fr]">
          <section className="rounded-lg border border-border bg-surface p-4" aria-labelledby="growth-h">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="growth-h" className="text-lg text-text">Pertumbuhan revenue</h2>
              <span className="text-xs text-text-3">Naik 12% dari bulan lalu</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sample.growth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis {...axisProps} dataKey="week" />
                  <YAxis {...axisProps} tickFormatter={idrTick} width={72} />
                  <Tooltip content={<ChartTooltip money />} cursor={cursorProps} />
                  <Line {...lineProps} dataKey="target" name="Target" stroke={CHART_MUTED} strokeDasharray="4 4" activeDot={false} />
                  <Line {...lineProps} dataKey="qris" name="QRIS" stroke={CHART_SERIES[0]} />
                  <Line {...lineProps} dataKey="partner" name="Network Partner" stroke={CHART_SERIES[1]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3">
              <ChartLegend
                items={[
                  { label: 'QRIS', color: CHART_SERIES[0] },
                  { label: 'Network Partner', color: CHART_SERIES[1] },
                  { label: 'Target', color: CHART_MUTED, dashed: true },
                ]}
              />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-4" aria-labelledby="target-h">
            <h2 id="target-h" className="mb-3 text-lg text-text">Target bulan ini</h2>
            <ul className="space-y-3.5">
              {sample.targets.map((t) => {
                const tone = targetTone(t.ratio);
                return (
                  <li key={t.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-text-2">{t.label}</span>
                      {tone !== 'green' && (
                        <span className={tone === 'red' ? 'text-xs text-red' : 'text-xs text-amber'}>
                          {tone === 'red' ? 'Di bawah 80%' : 'Hampir tercapai'}
                        </span>
                      )}
                    </div>
                    <Progress ratio={t.ratio} label={`Target ${t.label}`} />
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section className="mt-8" aria-labelledby="claims-h">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="claims-h" className="text-lg text-text">Klaim komisi terbaru</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Chip>Semua tim</Chip>
              <Segmented<Filter>
                label="Filter klaim"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'Semua', count: sample.claims.length },
                  { value: 'action', label: 'Perlu tindakan', count: needAction },
                  { value: 'mine', label: 'Milik saya', count: 2 },
                ]}
              />
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface">
              <EmptyState
                icon={<Inbox size={22} />}
                title="Belum ada klaim"
                description="Klaim muncul di sini setelah merchant berstatus Aktif."
              />
            </div>
          ) : (
            <>
              <div className="hidden sm:block">
                <Table>
                  <THead>
                    <tr>
                      <TH>ID</TH>
                      <TH>Merchant</TH>
                      <TH>Pengaju</TH>
                      <TH>Status</TH>
                      <TH>Tanggal</TH>
                      <TH numeric>Nominal</TH>
                    </tr>
                  </THead>
                  <tbody>
                    {claims.map((c) => (
                      <TR key={c.id} onClick={() => setSelected(c.id)} selected={selected === c.id}>
                        <TD mono>{c.id}</TD>
                        <TD>{c.merchant}</TD>
                        <TD muted>{c.owner}</TD>
                        <TD><StatusBadge map={CLAIM_STATUS} value={c.status} /></TD>
                        <TD muted>{formatDate(c.date)}</TD>
                        <TD numeric>{formatIDR(c.amount)}</TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="sm:hidden">
                <MobileCardList>
                  {claims.map((c) => (
                    <MobileCard
                      key={c.id}
                      title={c.merchant}
                      status={<StatusBadge map={CLAIM_STATUS} value={c.status} />}
                      meta={<span className="font-mono">{c.id}</span>}
                      amount={formatIDR(c.amount, { compact: true })}
                      onClick={() => setSelected(c.id)}
                    />
                  ))}
                </MobileCardList>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
