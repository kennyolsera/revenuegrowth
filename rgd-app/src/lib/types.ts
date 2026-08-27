// Tipe data yang merepresentasikan skema Supabase (lihat supabase/schema.sql).
// Disederhanakan untuk kebutuhan UI — sesuaikan bila skema Anda berkembang.

export type Role =
  | "super_admin"
  | "head_rg"
  | "team_rg"
  | "external_team"
  | "finance_ops";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  division: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string | null;
  region: string | null;
  phone: string | null;
  pic_internal: string | null;
  source: string | null;
  created_at: string;
}

export type PipelineStatus =
  | "diajukan"
  | "verifikasi"
  | "aktivasi"
  | "aktif"
  | "tidak_lanjut";

export interface QrisAcquisition {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  region: string | null;
  status: PipelineStatus;
  transaction_volume: number | null;
  submitted_at: string;
  pic: string | null;
  notes: string | null;
}

export type HandoverStatus =
  | "draft"
  | "siap_handover"
  | "terkirim"
  | "diproses_partner"
  | "selesai"
  | "ditolak";

export interface NetworkPartnerHandover {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  partner_name: string;
  contact_person: string | null;
  status: HandoverStatus;
  pic: string | null;
  created_at: string;
  notes: string | null;
}

export type OnlineOrderActivityType = "demo" | "onboarding" | "support" | "upgrade";
export type ActivityStatus = "baru" | "dijadwalkan" | "diproses" | "selesai" | "batal";

export interface OnlineOrderActivity {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  activity_type: OnlineOrderActivityType;
  priority: "low" | "medium" | "high" | "urgent";
  status: ActivityStatus;
  pic: string | null;
  scheduled_at: string | null;
  notes: string | null;
}

export type LoanStatus = "diajukan" | "disetujui" | "dicairkan" | "lunas" | "bermasalah";

export interface FinancingLoan {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  loan_amount: number;
  disbursed_at: string | null;
  revenue_before: number | null;
  revenue_after: number | null;
  status: LoanStatus;
  import_batch_id: string | null;
}

export type ClaimStatus = "diajukan" | "review" | "menunggu_dokumen" | "disetujui" | "ditolak";

export interface MerchantStatusClaim {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  feature: string;
  submitted_by_team: string;
  submitted_by_name?: string;
  checklist: { label: string; done: boolean }[];
  status: ClaimStatus;
  commission_estimate: number | null;
  notes: string | null;
  created_at: string;
}

export type RequestStatus = "baru" | "ditugaskan" | "diproses" | "selesai" | "batal";
export type RequestPriority = "low" | "medium" | "high" | "urgent";

export interface RequestCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface RequestTicket {
  id: string;
  category_id: string;
  category_name?: string;
  title: string;
  description: string | null;
  requester_name: string;
  requester_division: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  assigned_pic: string | null;
  created_at: string;
}

export interface LeadRawData {
  id: string;
  feature_category: string;
  file_name: string;
  uploaded_by: string | null;
  row_count: number;
  status: "baru" | "diproses";
  created_at: string;
}

export type CalendarEventType = "demo" | "onboarding" | "support" | "internal" | "lainnya";

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: CalendarEventType;
  start_time: string;
  end_time: string;
  merchant_id: string | null;
  merchant_name?: string;
  organizer: string | null;
  attendees: string | null;
  meeting_link: string | null;
  notes: string | null;
}

export interface ActionItem {
  label: string;
  pic: string;
  due_date: string | null;
  done: boolean;
}

export interface MeetingMinute {
  id: string;
  title: string;
  meeting_date: string;
  category: string;
  merchant_id: string | null;
  merchant_name?: string;
  participants: string;
  discussion_points: string;
  action_items: ActionItem[];
  created_by: string | null;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  demo_count: number;
  onboard_count: number;
  support_count: number;
  summary: string | null;
  created_at: string;
}
