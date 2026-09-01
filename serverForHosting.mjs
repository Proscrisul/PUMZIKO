// serverForHosting.mjs
//
// Passenger entry point for cPanel (Setup Node.js App > Application startup
// file). Passenger needs a fixed, predictable filename at the app root, so
// this thin wrapper imports the Angular-built SSR handler — which already
// serves the static assets in /browser and renders every page, see
// src/server.ts — and starts it listening.
//
// The SSR handler is imported ONCE at boot. If the build output is missing
// or broken the import throws here and Passenger refuses to start — a loud,
// visible failure instead of a site that silently errors on every request.

import express from 'express';
import { reqHandler } from './dist/PumzikoFE/server/server.mjs';

const app = express();
const PORT = process.env.PORT || 4000;

// Behind cPanel/Apache — trust the immediate proxy hop so req.protocol etc.
// reflect the real client request (X-Forwarded-* headers).
app.set('trust proxy', 1);

app.use((req, res, next) => {
  reqHandler(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Pumziko SSR server (wrapper) listening on port ${PORT}`);
});
