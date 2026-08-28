/** The site's pages are fixed and defined in the frontend. The backend only
 *  supplies the editable pieces: named copy snippets and per-page link-preview
 *  text. */

export type PageSlug =
  | 'home'
  | 'what-to-expect'
  | 'programmes'
  | 'sinners-only'
  | 'visit'
  | 'give'
  | 'contact';

/** GET /api/content/snippets/ — key is a dotted handle, e.g. "sinners-only.body". */
export interface Snippet {
  key: string;
  heading: string;
  body: string;
  ordering: number;
}

/** GET /api/content/meta/ — one row per page. */
export interface PageMeta {
  slug: PageSlug;
  og_title: string;
  og_description: string;
  og_image: string | null;
}
