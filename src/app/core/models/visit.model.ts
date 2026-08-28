/**
 * GET /api/visit/ — the address block (address, building_name, floor, matatu_*,
 * parking_notes, map_*, entrance_photo) is omitted by the API entirely until the
 * venue is confirmed, so every one of those fields is optional here.
 */
export interface VisitInfo {
  neighbourhood: string;
  venue_confirmed: boolean;
  venue_is_signed: boolean;
  venue_pending_message: string;
  first_sixty_seconds: string;
  venue_not_signed_note: string;
  updated_at: string;

  address?: string;
  building_name?: string;
  floor?: string;
  matatu_route?: string;
  matatu_stop?: string;
  parking_notes?: string;
  map_embed_url?: string;
  map_lat?: string | null;
  map_lng?: string | null;
  entrance_photo?: string | null;
}
