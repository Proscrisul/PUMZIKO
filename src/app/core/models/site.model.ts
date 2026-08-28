export type LaunchMode = 'PreLaunch' | 'ThisWeek';

export interface SiteSettings {
  church_name: string;
  tagline: string;
  gathering_day: string;
  gathering_start: string; // "HH:MM:SS"
  gathering_end: string;
  neighbourhood_label: string;
  launch_date: string | null; // ISO date
  launch_mode: LaunchMode;
  whatsapp_number: string;
  contact_email: string;
  reply_promise: string;
  updated_at: string;
}

export type SocialPlatform = 'TikTok' | 'Facebook' | 'YouTube' | 'Instagram';

export interface SocialLink {
  platform: SocialPlatform;
  handle: string;
  url: string;
  ordering: number;
}
