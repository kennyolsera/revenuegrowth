import {
  LayoutDashboard,
  QrCode,
  Network,
  ShoppingCart,
  Landmark,
  BadgeCheck,
  Inbox,
  FileBarChart,
  Database,
  CalendarDays,
  NotebookPen,
  Users,
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

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", translationKey: "nav_dashboard", icon: LayoutDashboard },
  { href: "/qris", label: "Akuisisi QRIS", translationKey: "nav_qris", icon: QrCode },
  { href: "/network-partner", label: "Network Partner", translationKey: "nav_network_partner", icon: Network },
  { href: "/online-order", label: "Online Order", translationKey: "nav_online_order", icon: ShoppingCart },
  { href: "/financing-loan", label: "Financing Loan", translationKey: "nav_financing_loan", icon: Landmark },
  { href: "/merchant-status", label: "Status & Klaim Komisi", translationKey: "nav_merchant_status", icon: BadgeCheck },
  { href: "/requests", label: "Request Form", translationKey: "nav_requests", icon: Inbox },
  { href: "/weekly-report", label: "Report Mingguan", translationKey: "nav_weekly_report", icon: FileBarChart },
  { href: "/leads", label: "Data Leads", translationKey: "nav_leads", icon: Database },
  { href: "/calendar", label: "Calendar & Meeting", translationKey: "nav_calendar", icon: CalendarDays },
  { href: "/mom", label: "MOM / Notulen", translationKey: "nav_mom", icon: NotebookPen },
  { href: "/users", label: "User Management", translationKey: "nav_users", icon: Users },
];
