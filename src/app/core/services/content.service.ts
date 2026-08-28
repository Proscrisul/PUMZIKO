import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';
import { PageMeta, PageSlug, Snippet } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private api = inject(ApiService);

  // Both sets are tiny and used by several pages — fetch once per request.
  private snippets$?: Observable<Snippet[]>;
  private meta$?: Observable<PageMeta[]>;

  snippets(): Observable<Snippet[]> {
    return (this.snippets$ ??= this.api
      .get<Snippet[]>('/content/snippets/')
      .pipe(shareReplay(1)));
  }

  /** All snippets whose key starts with `${prefix}.`, in order. */
  snippetsFor(prefix: string): Observable<Snippet[]> {
    return this.snippets().pipe(
      map(all =>
        all
          .filter(s => s.key.startsWith(`${prefix}.`))
          .sort((a, b) => a.ordering - b.ordering),
      ),
    );
  }

  meta(): Observable<PageMeta[]> {
    return (this.meta$ ??= this.api
      .get<PageMeta[]>('/content/meta/')
      .pipe(shareReplay(1)));
  }

  metaFor(slug: PageSlug): Observable<PageMeta | null> {
    return this.meta().pipe(map(all => all.find(m => m.slug === slug) ?? null));
  }
}
