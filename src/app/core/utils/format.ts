import { SiteSettings } from '../models/site.model';

/** "10:00:00" -> "10:00" */
export function hhmm(time: string | null | undefined): string {
  if (!time) return '';
  return time.slice(0, 5);
}

/** "Saturdays, 10:00–14:00" */
export function gatheringLine(s: Pick<SiteSettings, 'gathering_day' | 'gathering_start' | 'gathering_end'>): string {
  const day = s.gathering_day ? `${s.gathering_day}s` : '';
  return `${day}, ${hhmm(s.gathering_start)}–${hhmm(s.gathering_end)}`.trim();
}

/** Days between now and an ISO date; negative once past. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso + 'T00:00:00');
  const now = new Date();
  const ms = target.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / 86_400_000);
}

/** "Saturday 26 September 2026" */
export function longDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
