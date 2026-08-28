import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  AdminEnquiry, AdminGivingInfo, AdminMediaAsset, AdminPageMeta, AdminPerson,
  AdminProgramme, AdminProgrammeInterest, AdminQuestion, AdminSaturdayPart,
  AdminSiteSettings, AdminSnippet, AdminSocialLink, AdminVisitInfo, AdminWeekNote,
  DashboardStats, Paginated,
} from '../models/admin.model';

/** One service over every /api/admin/ endpoint. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private api = inject(ApiService);
  private base = '/admin';

  // ── Dashboard ──
  dashboard(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>(`${this.base}/dashboard/`);
  }

  // ── Singletons ──
  getSiteSettings() { return this.api.get<AdminSiteSettings>(`${this.base}/site-settings/`); }
  patchSiteSettings(body: Partial<AdminSiteSettings>) {
    return this.api.patch<AdminSiteSettings>(`${this.base}/site-settings/`, body);
  }

  getVisitInfo() { return this.api.get<AdminVisitInfo>(`${this.base}/visit-info/`); }
  patchVisitInfo(body: FormData | Partial<AdminVisitInfo>) {
    return this.api.patch<AdminVisitInfo>(`${this.base}/visit-info/`, body);
  }

  getGivingInfo() { return this.api.get<AdminGivingInfo>(`${this.base}/giving-info/`); }
  patchGivingInfo(body: Partial<AdminGivingInfo>) {
    return this.api.patch<AdminGivingInfo>(`${this.base}/giving-info/`, body);
  }

  getWeekNote() { return this.api.get<AdminWeekNote>(`${this.base}/week-note/`); }
  patchWeekNote(body: Partial<AdminWeekNote>) {
    return this.api.patch<AdminWeekNote>(`${this.base}/week-note/`, body);
  }

  // ── Collections (full CRUD) ──
  private crud<T>(resource: string) {
    const root = `${this.base}/${resource}/`;
    return {
      list: () => this.api.get<T[]>(root),
      create: (body: FormData | Partial<T>) => this.api.post<T>(root, body),
      update: (id: string, body: FormData | Partial<T>) => this.api.patch<T>(`${root}${id}/`, body),
      remove: (id: string) => this.api.delete<void>(`${root}${id}/`),
    };
  }

  socialLinks = this.crud<AdminSocialLink>('social-links');
  saturdayParts = this.crud<AdminSaturdayPart>('saturday-parts');
  questions = this.crud<AdminQuestion>('questions');
  programmes = this.crud<AdminProgramme>('programmes');
  people = this.crud<AdminPerson>('people');
  mediaAssets = this.crud<AdminMediaAsset>('media-assets');

  // ── Fixed sets (list + update only) ──
  listSnippets() { return this.api.get<AdminSnippet[]>(`${this.base}/snippets/`); }
  updateSnippet(id: string, body: Partial<AdminSnippet>) {
    return this.api.patch<AdminSnippet>(`${this.base}/snippets/${id}/`, body);
  }
  listPageMeta() { return this.api.get<AdminPageMeta[]>(`${this.base}/page-meta/`); }
  updatePageMeta(id: string, body: FormData | Partial<AdminPageMeta>) {
    return this.api.patch<AdminPageMeta>(`${this.base}/page-meta/${id}/`, body);
  }

  // ── Inboxes (paginated) ──
  enquiries(params: Record<string, string | number | boolean> = {}) {
    return this.api.get<Paginated<AdminEnquiry>>(`${this.base}/enquiries/`, params);
  }
  markEnquiryHandled(id: string) {
    return this.api.post<AdminEnquiry>(`${this.base}/enquiries/${id}/mark_handled/`, {});
  }
  markEnquiryUnhandled(id: string) {
    return this.api.post<AdminEnquiry>(`${this.base}/enquiries/${id}/mark_unhandled/`, {});
  }

  programmeInterest(params: Record<string, string | number | boolean> = {}) {
    return this.api.get<Paginated<AdminProgrammeInterest>>(`${this.base}/programme-interest/`, params);
  }
  markInterestNotified(id: string) {
    return this.api.post<AdminProgrammeInterest>(
      `${this.base}/programme-interest/${id}/mark_notified/`, {},
    );
  }
}
