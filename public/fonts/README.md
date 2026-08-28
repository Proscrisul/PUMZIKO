# Fonts

## Bebas Neue — display only

The site uses **Bebas Neue** for the wordmark and page titles only (never body
text — it has no lowercase and would shout a Kiswahili sentence in full caps).

Drop the licensed web font here as:

    public/fonts/BebasNeue-Regular.woff2

`src/styles.css` already declares the `@font-face`. Until the file is present the
site falls back to the system stack and still works — headings just render in
Roboto/Segoe/system-ui instead.

Confirm web/`@font-face` licensing for pumziko.org before shipping (brief §07,
"still needed from Vili").

## Everything else

The reading face is the system stack (`system-ui, "Segoe UI", Roboto, …`) — no
web font is downloaded for body copy. Archivo is only ever used flattened into
the social PNGs, which are a separate deliverable and not part of this app.
