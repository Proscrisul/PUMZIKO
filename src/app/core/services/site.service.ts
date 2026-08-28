import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { SiteSettings, SocialLink } from '../models/site.model';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private api = inject(ApiService);

  // Root services are request-scoped under SSR, so caching one copy of the
  // site-wide data per page load is safe and avoids repeat calls from the
  // layout, the footer and individual pages.
  private settings$?: Observable<SiteSettings>;
  private social$?: Observable<SocialLink[]>;

  settings(): Observable<SiteSettings> {
    return (this.settings$ ??= this.api
      .get<SiteSettings>('/site/')
      .pipe(shareReplay(1)));
  }

  socialLinks(): Observable<SocialLink[]> {
    return (this.social$ ??= this.api
      .get<SocialLink[]>('/site/social/')
      .pipe(shareReplay(1)));
  }
}
