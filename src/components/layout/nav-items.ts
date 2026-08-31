import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  QrCode,
  ShoppingCart,
  LineChart,
  Network,
  BadgeCheck,
  Inbox,
  FileBarChart,
  Database,
  Users,
  Activity,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  label: string;
  translationKey: TranslationKey;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  id: string;
  titleKey: TranslationKey;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operations",
    titleKey: "nav_group_operations",
    items: [
      { href: "/dashboard", label: "Dashboard", translationKey: "nav_dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar & Meetings", translationKey: "nav_calendar", icon: CalendarDays },
      { href: "/mom", label: "MOM Minutes", translationKey: "nav_mom", icon: NotebookPen },
    ],
  },
  {
    id: "feature",
    titleKey: "nav_group_features",
    items: [
      { href: "/qris", label: "QRIS", translationKey: "nav_qris", icon: QrCode },
      { href: "/online-order", label: "Online Order", translationKey: "nav_online_order", icon: ShoppingCart },
      { href: "/financing-performance", label: "Financing Performance", translationKey: "nav_financing_perf", icon: LineChart },
      { href: "/network-partner", label: "Network Partner", translationKey: "nav_network_partner", icon: Network },
    ],
  },
  {
    id: "data",
    titleKey: "nav_group_data",
    items: [
      { href: "/merchant-status", label: "Status & Commission Claim", translationKey: "nav_merchant_status", icon: BadgeCheck },
      { href: "/requests", label: "Request Form", translationKey: "nav_requests", icon: Inbox },
      { href: "/weekly-report", label: "Weekly Report", translationKey: "nav_weekly_report", icon: FileBarChart },
      { href: "/leads", label: "Leads Data", translationKey: "nav_leads", icon: Database },
    ],
  },
  {
    id: "settings",
    titleKey: "nav_group_settings",
    items: [
      { href: "/qris-providers", label: "QRIS Providers", translationKey: "nav_qris_providers", icon: CreditCard },
      { href: "/users", label: "User Management", translationKey: "nav_users", icon: Users },
      { href: "/logs", label: "Activity Log", translationKey: "nav_logs", icon: Activity },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
export const ALL_NAV_ITEMS: NavItem[] = NAV_ITEMS;
