import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  QrCode,
  Handshake,
  ShoppingBag,
  Landmark,
  BadgeCheck,
  Inbox,
  FileBarChart,
  Database,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/status';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavGroup {
  /** Uppercase micro label; omit for the top group. */
  label?: string;
  items: NavItem[];
}

const ALL: Role[] = ['super_admin', 'head_rg', 'team_rg', 'external_team', 'finance_ops'];
const INTERNAL: Role[] = ['super_admin', 'head_rg', 'team_rg'];

/**
 * Routes match the v1.0 build. Role lists are the PROPOSED matrix from DESIGN.md;
 * RLS in Supabase remains the real gate — this only hides nav a role can't use.
 */
export const NAV: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL },
      { href: '/calendar', label: 'Kalender', icon: CalendarDays, roles: ALL },
      { href: '/mom', label: 'Notulen (MOM)', icon: NotebookPen, roles: [...INTERNAL, 'finance_ops'] },
    ],
  },
  {
    label: 'Akuisisi',
    items: [
      { href: '/qris', label: 'QRIS', icon: QrCode, roles: INTERNAL },
      { href: '/network-partner', label: 'Network Partner', icon: Handshake, roles: INTERNAL },
      { href: '/online-order', label: 'Online Order', icon: ShoppingBag, roles: INTERNAL },
      { href: '/financing-loan', label: 'Financing Loan', icon: Landmark, roles: [...INTERNAL, 'finance_ops'] },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { href: '/merchant-status', label: 'Status Merchant & Klaim', icon: BadgeCheck, roles: ALL },
      { href: '/requests', label: 'Request', icon: Inbox, roles: ALL },
      { href: '/weekly-report', label: 'Report Mingguan', icon: FileBarChart, roles: [...INTERNAL, 'finance_ops'] },
      { href: '/leads', label: 'Data Leads', icon: Database, roles: INTERNAL },
    ],
  },
  {
    label: 'Admin',
    items: [{ href: '/users', label: 'Pengguna & Role', icon: Users, roles: ['super_admin'] }],
  },
];

/** Nav filtered for one role; empty groups are dropped (never show disabled nav). */
export function navFor(role: Role): NavGroup[] {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length > 0);
}
