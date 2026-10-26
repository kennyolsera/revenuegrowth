'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Plus, Search, X, HelpCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Role } from '@/lib/status';
import { IconButton, Button } from '@/components/ui/button';
import { navFor } from './nav';

interface ShellProps {
  role: Role;
  userName: string;
  /** Breadcrumb trail, last item is the current page. */
  crumbs?: string[];
  children: React.ReactNode;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-2xs font-semibold"
      style={{
        background: 'color-mix(in srgb, var(--accent) 17%, var(--surface))',
        color: 'color-mix(in srgb, var(--accent) 55%, var(--text))',
      }}
    >
      {initials(name)}
    </span>
  );
}

function Sidebar({ role, userName, onNavigate }: { role: Role; userName: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = navFor(role);

  return (
    <nav aria-label="Navigasi utama" className="flex h-full flex-col bg-side px-2 py-3">
      <div className="mb-3 flex h-8 items-center gap-2 px-2">
        <span aria-hidden className="h-5 w-5 rounded-xs bg-accent" />
        <span className="text-sm font-semibold text-text">Revenue Growth</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.map((g, gi) => (
          <div key={g.label ?? gi} className={gi > 0 ? 'mt-4' : ''}>
            {g.label && (
              <div className="px-2 pb-1 text-2xs font-medium uppercase tracking-[0.06em] text-text-4">{g.label}</div>
            )}
            <ul>
              {g.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex h-side-row items-center gap-2 rounded-sm px-2 text-base font-side transition-colors',
                        active
                          ? 'bg-surface text-text shadow-sm'
                          : 'text-text-2 hover:bg-surface-3 hover:text-text',
                      )}
                    >
                      <Icon size={15} strokeWidth={1.75} className={active ? 'text-text' : 'text-text-3'} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-border pt-2">
        <Link href="/help" className="flex h-side-row items-center gap-2 rounded-sm px-2 text-base font-side text-text-2 hover:bg-surface-3">
          <HelpCircle size={15} strokeWidth={1.75} className="text-text-3" /> Bantuan
        </Link>
        <Link href="/settings" className="flex h-side-row items-center gap-2 rounded-sm px-2 text-base font-side text-text-2 hover:bg-surface-3">
          <Settings size={15} strokeWidth={1.75} className="text-text-3" /> Pengaturan
        </Link>
        <div className="mt-1 flex h-9 items-center gap-2 px-2">
          <Avatar name={userName} />
          <span className="truncate text-sm text-text-2">{userName}</span>
        </div>
      </div>
    </nav>
  );
}

/** App shell: 252px sidebar | content. ≤900px the sidebar becomes an off-canvas drawer. */
export function AppShell({ role, userName, crumbs = [], children }: ShellProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-bg min-[901px]:grid min-[901px]:grid-cols-[var(--side-w)_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-2 focus:shadow-pop">
        Lewati ke konten
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-border min-[901px]:block">
        <Sidebar role={role} userName={userName} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 min-[901px]:hidden">
          <div className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} aria-hidden />
          <aside className="rise-in absolute inset-y-0 left-0 w-[280px] shadow-pop" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute right-2 top-2 z-10">
              <IconButton label="Tutup menu" onClick={() => setOpen(false)}>
                <X size={16} />
              </IconButton>
            </div>
            <Sidebar role={role} userName={userName} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-topbar items-center gap-2 border-b border-border bg-bg px-gutter">
          <IconButton label="Buka menu" className="min-[901px]:hidden" onClick={() => setOpen(true)}>
            <Menu size={16} />
          </IconButton>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1 truncate text-sm">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={i} className={cn(!last && 'hidden sm:inline')}>
                  <span className={last ? 'font-medium text-text' : 'text-text-3'}>{c}</span>
                  {!last && <span className="mx-1.5 text-text-4">/</span>}
                </span>
              );
            })}
          </nav>
          <button
            type="button"
            className="hidden h-h-md items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-sm text-text-3 hover:bg-surface-2 min-[1101px]:inline-flex"
          >
            <Search size={14} /> Cari
            <kbd className="ml-6 rounded-xs border border-border border-b-[1.5px] px-1 font-mono text-2xs text-text-3">⌘K</kbd>
          </button>
          <IconButton label="Cari" className="min-[1101px]:hidden">
            <Search size={15} />
          </IconButton>
          <IconButton label="Notifikasi">
            <Bell size={15} />
          </IconButton>
          <Button variant="secondary" size="md" icon={<Plus size={14} />} className="hidden sm:inline-flex">
            Baru
          </Button>
        </header>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
