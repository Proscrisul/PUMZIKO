import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoInput {
  title: string;
  description?: string;
  image?: string | null;
  /** Path only, e.g. "/visit". Combined with the site URL for og:url. */
  path?: string;
}

/**
 * Sets the document title and Open Graph / Twitter tags. Runs during SSR so a
 * pumziko.org link pasted into WhatsApp unfurls with the right page's text —
 * the brief notes most traffic arrives as a forwarded link.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  update({ title, description, image, path }: SeoInput): void {
    const fullTitle = /pumziko/i.test(title) ? title : `${title} · Pumziko`;
    this.title.setTitle(fullTitle);

    this.setTag('og:title', title);
    this.setTag('twitter:title', title);

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.setTag('og:description', description);
      this.setTag('twitter:description', description);
    }

    if (image) {
      this.setTag('og:image', image);
      this.setTag('twitter:image', image);
    }

    if (path) {
      this.setTag('og:url', `${environment.siteUrl}${path}`);
    }
  }

  private setTag(key: string, content: string): void {
    const attr = key.startsWith('og:') ? 'property' : 'name';
    this.meta.updateTag({ [attr]: key, content } as Record<string, string>);
  }
}
