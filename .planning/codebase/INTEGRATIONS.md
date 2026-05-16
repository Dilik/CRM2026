# External Integrations

**Analysis Date:** 2026-05-16

## APIs & External Services

**None currently integrated.**

No third-party API SDKs or service clients are present in `goodwell-service-os/package.json` or imported in `goodwell-service-os/src/`. The application is a freshly scaffolded Next.js project with no external service dependencies wired up yet.

## Data Storage

**Databases:**
- None configured. No database client, ORM, or connection library detected (no Prisma, Drizzle, Mongoose, pg, etc.).

**File Storage:**
- Local static assets only (`goodwell-service-os/public/`). No cloud storage SDK (S3, GCS, Cloudinary, etc.) present.

**Caching:**
- None. No Redis, Memcached, or cache client detected.

## Authentication & Identity

**Auth Provider:**
- None configured. No auth library (NextAuth.js, Clerk, Auth0, Supabase Auth, etc.) detected in dependencies or source files.

## Fonts & Static Assets

**Google Fonts (via Next.js):**
- Geist Sans and Geist Mono are loaded at build time through `next/font/google` in `goodwell-service-os/src/app/layout.tsx`.
- This makes a network request to Google Fonts CDN during the build process; at runtime, fonts are self-hosted by Next.js (no client-side Google Fonts CDN dependency).
- No API key required.

## Monitoring & Observability

**Error Tracking:**
- Not configured. No Sentry, Datadog, LogRocket, or similar SDK present.

**Logs:**
- No logging library configured. Default Node.js / Next.js console output only.

**Analytics:**
- Not configured. No analytics SDK detected.

## CI/CD & Deployment

**Hosting:**
- Not yet configured. No Vercel config (`vercel.json`), Dockerfile, or cloud platform config files detected.
- The default `page.tsx` template references Vercel deploy links, suggesting Vercel is the intended platform.

**CI Pipeline:**
- None. No GitHub Actions workflows, CircleCI, or similar CI config detected.

## Environment Configuration

**Required env vars:**
- None currently required. The application has no environment variable usage in its source files.

**Secrets location:**
- No `.env` files exist in the project. When integrations are added, follow Next.js conventions:
  - `goodwell-service-os/.env.local` — local overrides (gitignored)
  - `goodwell-service-os/.env` — committed defaults
  - Server-only vars: no `NEXT_PUBLIC_` prefix
  - Client-exposed vars: must use `NEXT_PUBLIC_` prefix

## Webhooks & Callbacks

**Incoming:**
- None. No API route handlers detected under `goodwell-service-os/src/app/api/`.

**Outgoing:**
- None.

## Summary

This is a greenfield Next.js 16 scaffold. No external integrations exist yet. All integration work (database, auth, APIs, monitoring) remains to be implemented. When adding integrations, place service clients in `goodwell-service-os/src/lib/` (to be created) and API route handlers under `goodwell-service-os/src/app/api/`.

---

*Integration audit: 2026-05-16*
