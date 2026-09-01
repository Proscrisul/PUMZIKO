# PumzikoFE

The website for **pumziko.org**: a public marketing site (server-rendered, no
auth) plus a JWT-gated **admin at `/admin`** where Steve & Vili edit every piece
of content. Angular 21 (standalone, zoneless, SSR), talking to **PumzikoBE**.

Structure follows the reference project `Church System/ZimmermanSDAFE` —
`core/` (services, models, interceptors, guards), `features/public` +
`features/admin`, `shared/components` + `shared/admin`, `environments/`.

## Stack

| | |
|---|---|
| Framework | Angular 21, standalone components, zoneless change detection |
| Rendering | SSR on every request (`RenderMode.Server`) so WhatsApp link previews unfurl with live copy |
| Styling | Tailwind v4 + a small design system in `src/styles.css` (ink / bone / ember) |
| Icons | `@lucide/angular`, only the ~10 used icons registered in `app.config.ts` |
| Data | `HttpClient` (fetch) → `environment.apiUrl` (`http://127.0.0.1:8000/api` in dev) |

## Run

```bash
npm install
# start the backend first (PumzikoBE): python manage.py runserver 8000

npm start                      # dev server, http://localhost:4200
# or, to exercise SSR exactly as production:
npm run build && node dist/PumzikoFE/server/server.mjs   # http://localhost:4000
```

Set the API location per environment in `src/environments/environment.ts`
(prod) and `environment.development.ts` (dev). `angular.json →
architect.build.options.security.allowedHosts` lists the hostnames the SSR
server will render for — add the real domain before deploying.

## How it maps to the brief

| Page | Route | Source |
|---|---|---|
| Home | `/home` | above-the-fold name/tagline/time/place + one button; then the seven-part Saturday, then the launch block (or "This week at Pumziko" once `launch_mode` flips) |
| What to expect | `/what-to-expect` | the seven parts with real times, "asking questions" given its own box above the fold, the six answers as headings, WhatsApp at the end |
| Programmes | `/programmes` | the five planned programmes, all future tense; each has a "tell me when this starts" form posting to one list; Sabbath Sofa links out |
| Why "Sinners Only" | `/sinners-only` | renders the CMS page's sections verbatim |
| Visit | `/visit` | shows only the neighbourhood + "message us" until the venue is confirmed in the admin; then address, matatu, floor, entrance photo, map |
| Give | `/give` | M-Pesa / bank / card, "Visitors are not expected to give anything, ever." as the headline. When `giving.mpesa_stk_enabled` is on, also a "give now by M-Pesa" form: `PaymentsService.stkPush()` then poll `PaymentsService.status(cid)` every 3 s until Success / Failed / Timeout |
| Contact | `/contact` | WhatsApp first and largest, then email, then a short form; Steve & Vili's faces and the "We reply within a day" promise |

The **page set and the navigation are fixed in the frontend** — the routes in
`public.routes.ts` and the `NAV_LINKS` constant in `public-layout.component.ts`.
There is no `/api/pages/` call and no generic slug route. The backend supplies
only the *editable pieces*: keyed copy fragments (`GET /api/content/snippets/`,
e.g. `sinners-only.body`, `home.who-this-is-for`) and per-page Open Graph text
(`GET /api/content/meta/`). Unknown URLs fall through to the not-found page.

Every page sets its own `<title>` and Open Graph tags from its `content/meta`
row, with a sensible fallback used before the data loads (and during SSR if the
API is unreachable — every fetch is wrapped so the site degrades quietly).

## Admin (`/admin`)

JWT login against `/api/auth/login/`; access + refresh tokens in `localStorage`;
`authInterceptor` attaches the bearer and does one silent refresh on a 401 before
bouncing to `/admin/login`. `authGuard` protects the shell; admin routes are
`RenderMode.Client` (never SSR-ed).

| Screen | Edits |
|---|---|
| Dashboard | live counts + jump links |
| Site settings | the site-wide singleton + social links (add/edit/delete) |
| The Saturday | the seven parts (CRUD) + the "This week at Pumziko" note |
| The six answers | questions (CRUD) |
| Programmes | programmes (CRUD) with the minors / child-protection-policy toggles and the `safe_to_run` warning |
| People | Steve, Vili, … (CRUD + photo upload) |
| Page copy & SEO | the `content/snippets` fragments + per-page Open Graph text and image (edit only — fixed set) |
| Visit / Giving | the singleton forms, entrance-photo upload on Visit |
| Images | `media-assets` CRUD + upload |
| Enquiries / Programme interest | filterable inboxes, mark handled / mark told |

All writes go to `/api/admin/…` via `core/services/admin-api.service.ts`
(`IsEditorOrAdmin` on the backend). Django admin stays available as a fallback.

Create editor accounts in Django admin (role *Editor*, staff, in the *Editors*
group) or `createsuperuser`.

## Key pieces

| Path | What |
|---|---|
| `src/app/core/services/*.service.ts` | one thin service per API area over `ApiService`; `site.service.ts` caches the site-wide data per request |
| `src/app/core/services/seo.service.ts` | `Title` + `Meta` (og / twitter), SSR-safe |
| `src/app/features/public/page-seo.ts` | `connectPageMeta(slug, fallback)` — fetch a page's OG text + wire its SEO |
| `src/app/features/public/public-layout/` | fixed nav (`NAV_LINKS`) + footer + persistent WhatsApp button |
| `src/app/shared/components/wordmark/` | the wordmark with the ember cross in the I; geometry from brief §02; suppressed below 40px |
| `src/app/shared/components/rest-bar/` | the rest bar; its block alone is the favicon (`public/favicon.svg`) |
| `src/app/core/{services/auth.service,interceptors/auth.interceptor,guards}` | JWT auth for the admin |
| `src/app/features/admin/` + `src/app/shared/admin/` | the admin shell, screens, and its form/table widgets |

## Assets to supply

- `public/fonts/BebasNeue-Regular.woff2` — the licensed display face (see
  `public/fonts/README.md`). The site falls back to the system stack without it.
- Real photographs (the room, the entrance, Steve & Vili) are uploaded through
  the admin, not committed here.

## Notes

- Production build initial transfer is ~**108 kB** (well under the brief's 1 MB
  home-page budget). Public pages and the whole admin are lazy chunks.
- No web font is downloaded for body copy — the system stack resolves to Roboto
  on the Android phones this audience carries.
- `npm test` runs the Vitest unit tests.

## CI / deploy

`.github/workflows/ci.yml` runs `npm ci`, `npm run build` and the unit tests on
every push / PR.

`.github/workflows/deploy.yml` builds the SSR bundle in CI and ships it to a
cPanel Node.js (Passenger) app on push to `main`: `scp` `dist/**` +
`package*.json` + `serverForHosting.mjs` into `APP_DIR`, then `npm ci --omit=dev`
and `touch tmp/restart.txt`. `serverForHosting.mjs` is the fixed Passenger entry
file — a thin Express wrapper around `dist/PumzikoFE/server/server.mjs`. Set the
cPanel app's **Application startup file** to it, edit `APP_DIR` / `NODE_VENV` in
the workflow, add the `SSH_*` secrets, and set the `API_URL` / `SITE_URL` repo
variables so the bundle is built against the real API.
