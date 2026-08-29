import { ContactMethod } from './programme.model';
import { EnquirySource } from './enquiry.model';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Full editable shapes (superset of the public read models) ──────────────

export interface AdminSiteSettings {
  id: string;
  church_name: string;
  tagline: string;
  gathering_day: string;
  gathering_start: string;
  gathering_end: string;
  neighbourhood_label: string;
  launch_date: string | null;
  launch_mode: 'PreLaunch' | 'ThisWeek';
  whatsapp_number: string;
  contact_email: string;
  reply_promise: string;
  updated_at: string;
}

export interface AdminSocialLink {
  id: string;
  platform: 'TikTok' | 'Facebook' | 'YouTube' | 'Instagram';
  handle: string;
  url: string;
  is_active: boolean;
  ordering: number;
}

export interface AdminSaturdayPart {
  id: string;
  label: string;
  description: string;
  time_label: string;
  ordering: number;
  is_headline: boolean;
}

export interface AdminWeekNote {
  id: string;
  heading: string;
  body: string;
  is_published: boolean;
  updated_at: string;
}

export interface AdminQuestion {
  id: string;
  question_text: string;
  answer_text: string;
  ordering: number;
  is_published: boolean;
}

export interface AdminProgramme {
  id: string;
  name: string;
  blurb: string;
  status: 'Planned' | 'StartingSoon' | 'Running';
  external_url: string;
  starts_note: string;
  ordering: number;
  is_published: boolean;
  involves_minors: boolean;
  child_protection_policy_ready: boolean;
  safe_to_run: boolean;
}

export interface AdminPerson {
  id: string;
  name: string;
  role_title: string;
  bio: string;
  photo: string | null;
  ordering: number;
  is_published: boolean;
}

export interface AdminSnippet {
  id: string;
  key: string;
  heading: string;
  body: string;
  ordering: number;
  updated_at: string;
}

export interface AdminPageMeta {
  id: string;
  slug: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  updated_at: string;
}

export interface AdminMediaAsset {
  id: string;
  name: string;
  file: string;
  kind: 'Photo' | 'Social' | 'Other';
  alt: string;
  created_at: string;
}

export interface AdminVisitInfo {
  id: string;
  neighbourhood: string;
  venue_confirmed: boolean;
  venue_is_signed: boolean;
  venue_pending_message: string;
  first_sixty_seconds: string;
  venue_not_signed_note: string;
  address: string;
  building_name: string;
  floor: string;
  matatu_route: string;
  matatu_stop: string;
  parking_notes: string;
  map_embed_url: string;
  map_lat: string | null;
  map_lng: string | null;
  entrance_photo: string | null;
  updated_at: string;
}

export interface AdminGivingInfo {
  id: string;
  mpesa_paybill: string;
  mpesa_account: string;
  mpesa_till: string;
  mpesa_stk_enabled: boolean;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  bank_swift: string;
  card_url: string;
  intro_note: string;
  visitors_note: string;
  updated_at: string;
}

export interface AdminEnquiry {
  id: string;
  name: string;
  contact_method: ContactMethod;
  contact_value: string;
  message: string;
  source: EnquirySource;
  handled: boolean;
  handled_by: string | null;
  handled_by_email: string | null;
  handled_at: string | null;
  created_at: string;
}

export interface AdminProgrammeInterest {
  id: string;
  programme: string;
  programme_name: string;
  name: string;
  contact_method: ContactMethod;
  contact_value: string;
  notified: boolean;
  created_at: string;
}

export interface DashboardStats {
  enquiries_unhandled: number;
  enquiries_total: number;
  interest_unnotified: number;
  interest_total: number;
  programmes: number;
  people: number;
  questions: number;
  launch_date: string | null;
  launch_mode: 'PreLaunch' | 'ThisWeek';
}
