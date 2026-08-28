import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public pages: server-rendered per request so WhatsApp link previews unfurl
 * with the current copy. The admin is auth-gated and token-driven — client
 * render only.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
