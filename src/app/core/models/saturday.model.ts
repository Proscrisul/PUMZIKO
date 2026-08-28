export interface SaturdayPart {
  label: string;
  description: string;
  time_label: string;
  ordering: number;
  is_headline: boolean;
}

export interface WeekNote {
  heading: string;
  body: string;
  is_published: boolean;
  updated_at: string;
}
