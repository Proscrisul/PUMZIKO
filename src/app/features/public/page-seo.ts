import { effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { PageMeta, PageSlug } from '../../core/models/content.model';
import { ContentService } from '../../core/services/content.service';
import { SeoService, SeoInput } from '../../core/services/seo.service';

/**
 * Wires a fixed page's SEO tags: sets the fallback immediately (so SSR always
 * emits something sane) and swaps in the editable Open Graph text from the API
 * once it arrives. Call from a component field initializer or constructor.
 * Returns the meta signal (rarely needed, but valid to assign to a field).
 */
export function connectPageMeta(
  slug: PageSlug,
  fallback: SeoInput,
): Signal<PageMeta | null> {
  const content = inject(ContentService);
  const seo = inject(SeoService);

  const meta = toSignal(
    content.metaFor(slug).pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  seo.update(fallback);

  effect(() => {
    const m = meta();
    if (m) {
      seo.update({
        title: m.og_title || fallback.title,
        description: m.og_description || fallback.description,
        image: m.og_image,
        path: fallback.path,
      });
    }
  });

  return meta;
}
