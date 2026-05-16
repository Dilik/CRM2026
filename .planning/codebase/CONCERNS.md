# Codebase Concerns

**Analysis Date:** 2026-05-16

---

## Summary

This is a bare `create-next-app` boilerplate. None of the six planned CRM modules exist yet. Every concern below represents a gap between the current boilerplate state and the production service-center platform described in `README.md`.

---

## Missing Infrastructure (Blockers)

**No database layer:**
- Issue: PostgreSQL + Prisma ORM is listed as planned stack in `README.md` but neither `prisma` nor any database client appears in `goodwell-service-os/package.json`.
- Files: `goodwell-service-os/package.json`
- Impact: No data can be persisted. All six CRM modules (CRM, Service Orders, Warehouse, Finance, Staff, Reports) are impossible to build without this.
- Fix approach: `npm install prisma @prisma/client`, run `npx prisma init`, define schema, add `DATABASE_URL` to `.env.local`.

**No authentication system:**
- Issue: No auth library installed. No auth routes exist. No session handling. Any URL in the app is publicly accessible.
- Files: `goodwell-service-os/src/app/` (only `layout.tsx` and `page.tsx` exist)
- Impact: A CRM with customer records, financial data, and staff information cannot ship without auth. This is a security blocker.
- Fix approach: Install and configure an auth solution (e.g., NextAuth.js / Auth.js, Clerk, or Supabase Auth). Add a `proxy.ts` (see Next.js 16 naming below) to protect all routes behind a login check.

**No API layer (tRPC):**
- Issue: `trpc` is planned in `README.md` but not installed. No `server/` directory, no routers, no procedure definitions.
- Files: `goodwell-service-os/package.json`
- Impact: No type-safe client-server communication. All data fetching patterns are undefined.
- Fix approach: Install `@trpc/server @trpc/client @trpc/next @tanstack/react-query`, scaffold `src/server/trpc.ts` and `src/app/api/trpc/[trpc]/route.ts`.

**No internationalisation (i18n):**
- Issue: `next-intl` is planned for uz/ru/en support but is not installed. `goodwell-service-os/src/app/layout.tsx` hardcodes `lang="en"`.
- Files: `goodwell-service-os/src/app/layout.tsx`, `goodwell-service-os/package.json`
- Impact: Goodwell.uz is an Uzbek service center — hardcoded English is incorrect for production. Route structure (`/[lang]/...`) has not been established, meaning any future i18n migration will require restructuring all existing routes.
- Fix approach: Install `next-intl`, create `src/i18n/` config, add `[lang]` dynamic segment at the root, and define message catalogs for uz/ru/en before any feature routes are added.

**No UI component library:**
- Issue: shadcn/ui is planned in `README.md` but not installed. Only raw Tailwind CSS 4 is present.
- Files: `goodwell-service-os/package.json`
- Impact: Every UI element must be built from scratch without a shared component system. Consistency and speed suffer.
- Fix approach: Run `npx shadcn@latest init` after deciding on a color theme. Do this before building any feature UI.

---

## Next.js 16 Breaking Changes (Must-Know Before Writing Code)

**AGENTS.md explicitly warns:** "This is NOT the Next.js you know. This version has breaking changes." The upgrade guide at `goodwell-service-os/node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` documents the following breaking changes that affect all code written for this project:

**Async-only Request APIs:**
- Issue: `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now async-only. Synchronous access is removed in Next.js 16.
- Impact: Any code that accesses these synchronously (as in Next.js 13/14 patterns) will fail at runtime — not at compile time. This is invisible until the app runs.
- Fix approach: Always `await cookies()`, `await headers()`, `await props.params`, `await props.searchParams` in every route, layout, and page. Use `npx next typegen` to generate type helpers (`PageProps`, `LayoutProps`, `RouteContext`).

**`middleware.ts` is deprecated — renamed to `proxy.ts`:**
- Issue: Next.js 16 renames `middleware` to `proxy` (both the file name and the exported function name). The edge runtime is NOT supported in `proxy.ts`; it runs Node.js only.
- Impact: Any Claude instance that writes `middleware.ts` using training-data patterns will produce deprecated code that will trigger deprecation warnings. Edge-runtime auth guards (common in Next.js 13/14 examples) are no longer supported in this file.
- Fix approach: Create `goodwell-service-os/proxy.ts` (not `middleware.ts`). Export `proxy` function (not `middleware`). Do not set `runtime = 'edge'`. Use `skipProxyUrlNormalize` (not `skipMiddlewareUrlNormalize`) in `next.config.ts`.

**`revalidateTag` requires a second argument:**
- Issue: `revalidateTag('tag')` is deprecated. The second argument (a `cacheLife` profile, e.g. `'max'`) is now required and produces a TypeScript error if omitted.
- Impact: All cache invalidation code written without the second argument will produce type errors.
- Fix approach: Always use `revalidateTag('tag', 'max')` or switch to `updateTag('tag')` for read-your-writes semantics in Server Actions.

**Parallel routes require explicit `default.js`:**
- Issue: All parallel route slots (`@slotName/`) now require a `default.js` or `default.tsx` file. Builds fail without them.
- Impact: Any parallel route added during feature development will break the build if `default.tsx` is missing.
- Fix approach: When creating any `@slot` directory, immediately add `default.tsx` that returns `null` or calls `notFound()`.

**`next lint` command removed:**
- Issue: The `lint` script in `goodwell-service-os/package.json` runs `eslint` directly (correct), but any documentation or script that calls `next lint` will fail — the command no longer exists in Next.js 16.
- Files: `goodwell-service-os/package.json`
- Impact: Low — current scripts are already correct. Risk is in documentation or CI pipelines that might use `next lint`.

**`serverRuntimeConfig` / `publicRuntimeConfig` removed:**
- Issue: These config options no longer exist. Any plugin or example copied from older Next.js docs that uses `getConfig()` will break.
- Impact: Use `process.env.VAR` in Server Components and `NEXT_PUBLIC_VAR` for client-accessible values.

**Turbopack is now the default build tool:**
- Issue: `next build` uses Turbopack by default. Any `webpack` configuration added to `next.config.ts` will cause builds to fail unless `--webpack` flag is used.
- Files: `goodwell-service-os/next.config.ts`
- Impact: Common plugins and loaders written for Webpack may not be compatible. This affects future package choices (e.g., some SVG loaders, Sass `~` prefix imports from `node_modules`).
- Fix approach: Prefer Turbopack-native solutions. Use `turbopack.resolveAlias` instead of `webpack.resolve.fallback`. Check Turbopack compatibility before adding any webpack plugin.

---

## Security Considerations

**No environment variable configuration present:**
- Risk: No `.env.local`, no `.env.example`, no documentation of required secrets. When database and auth are added, there is no guardrail preventing secrets from being committed or misconfigured.
- Files: `goodwell-service-os/.gitignore` (correctly excludes `.env*` — this is good)
- Current mitigation: `.gitignore` already excludes `.env*` files.
- Recommendations: Create `.env.example` with placeholder values (non-secret) to document required variables before adding any integration. Add a startup check that throws if required env vars are missing.

**No Content Security Policy:**
- Risk: `goodwell-service-os/next.config.ts` contains no security headers. A CRM handling customer PII, financial records, and repair orders needs CSP, HSTS, and X-Frame-Options headers.
- Files: `goodwell-service-os/next.config.ts`
- Recommendations: Add `headers()` to `next.config.ts` with a strict CSP before any page goes to production.

**No input validation library:**
- Risk: No `zod` or equivalent schema validation is installed. All form data entering the system (service orders, customer records, invoices) will be unvalidated.
- Files: `goodwell-service-os/package.json`
- Recommendations: Install `zod` early. Define schemas alongside tRPC procedures (natural fit). Validate all user input server-side.

---

## Test Coverage Gaps

**No tests exist:**
- What is not tested: Everything. There is no test runner configured, no test files, and no test utilities installed.
- Files: `goodwell-service-os/package.json` (no `jest`, `vitest`, `@testing-library/*`, or `playwright`)
- Risk: All six planned modules will be built without any automated regression coverage.
- Priority: High — establish testing infrastructure before feature work begins, not after.
- Fix approach: Install Vitest + `@testing-library/react` for unit/component tests. Install Playwright for E2E. Add `"test"` and `"test:e2e"` scripts to `package.json`.

---

## Tech Debt

**Boilerplate metadata not replaced:**
- Issue: `goodwell-service-os/src/app/layout.tsx` exports `title: "Create Next App"` and `description: "Generated by create next app"`.
- Files: `goodwell-service-os/src/app/layout.tsx`
- Impact: Search engines and browser tabs show the wrong app name.
- Fix approach: Replace with `title: "Goodwell Service OS"` and an appropriate description before any deployment.

**Default boilerplate page never removed:**
- Issue: `goodwell-service-os/src/app/page.tsx` is the unmodified `create-next-app` welcome page. It links to Vercel templates and the Next.js learning center.
- Files: `goodwell-service-os/src/app/page.tsx`
- Impact: Low functional impact now; becomes confusing noise as real routes are added.
- Fix approach: Replace with a redirect to `/login` (or `/[lang]/login` once i18n is added) as the first real route work.

**`next.config.ts` is empty:**
- Issue: `goodwell-service-os/next.config.ts` has no configuration. Several production concerns (security headers, image remote patterns, i18n, React Compiler) need to be configured here.
- Files: `goodwell-service-os/next.config.ts`
- Impact: Defaults are used for everything, some of which are not production-safe (e.g., no security headers, no content security policy).
- Fix approach: Progressively populate as infrastructure is added. Do not leave it empty when integrating external image sources.

**`public/` directory contains Vercel/Next.js branding assets:**
- Issue: `goodwell-service-os/public/` contains `vercel.svg`, `next.svg`, `globe.svg`, `file.svg`, `window.svg` — all boilerplate assets from `create-next-app`.
- Files: `goodwell-service-os/public/`
- Impact: Unnecessary files in the production bundle.
- Fix approach: Remove boilerplate SVGs when replacing `page.tsx`. Add Goodwell branding assets.

---

## Missing Critical Features (All Six Modules)

**CRM — Customers & Contacts:**
- Problem: No customer model, no contact records, no search, no history.
- Blocks: Service order creation requires customer lookup. All other modules assume customer records exist.

**Service Orders — Repair Job Tracking:**
- Problem: No order model, no status workflow (received → diagnosed → repaired → returned), no technician assignment.
- Blocks: Core business operation of the service center.

**Warehouse — Spare Parts Inventory:**
- Problem: No parts catalog, no stock levels, no part consumption tracking against service orders.
- Blocks: Finance module (parts cost per repair), purchasing decisions.

**Finance — Invoices & Payments:**
- Problem: No invoice generation, no payment recording, no reporting integration.
- Blocks: Revenue visibility for the business.

**Staff & HR — Employees & Roles:**
- Problem: No employee records, no role-based access control (RBAC). Without RBAC, all authenticated users would have equal access to all data.
- Blocks: Multi-user operation. A technician should not see payroll; a manager should not be able to delete financial records.

**Reports & Analytics:**
- Problem: No data aggregation layer, no charting libraries installed.
- Blocks: Business intelligence for the service center.

---

## Dependencies at Risk

**React 19.2 (canary channel):**
- Risk: `react@19.2.4` is a canary/pre-release build. Third-party libraries may not support React 19 APIs (`use`, `Activity`, `ViewTransition`). Many ecosystem packages still test against React 18.
- Impact: Package installation failures or runtime errors when integrating UI libraries, form libraries, or data-fetching wrappers.
- Migration plan: Check React 19 compatibility for every package before installing. Prefer libraries with explicit React 19 support statements.

**Next.js 16.2.6 (very new, limited community resources):**
- Risk: Next.js 16 is a major version with significant breaking changes (documented above). Stack Overflow answers, blog posts, and AI training data predominantly cover Next.js 13/14/15. Code suggestions from any AI assistant may be incorrect for Next.js 16 patterns.
- Impact: Slower development, higher error rate when following examples found online.
- Mitigation: The `AGENTS.md` and `CLAUDE.md` files correctly warn about this. Always read `goodwell-service-os/node_modules/next/dist/docs/` before implementing new patterns.

---

## Scaling Limits

**No caching strategy defined:**
- Current capacity: Single-user local dev only.
- Limit: Default Next.js 16 caching applies. No `cacheLife` profiles configured, no `cacheTag` strategy planned.
- Scaling path: Define cache profiles in `next.config.ts` under `cacheLife`. Use `cacheTag` on data fetches, `updateTag` in Server Actions for write operations.

**No deployment target configured:**
- Current capacity: Local `npm run dev` only.
- Limit: No adapter configured. Next.js 16 introduces a Build Adapters API (alpha in 16.0, promoted to stable top-level in 16.2).
- Scaling path: Decide deployment target (Vercel, self-hosted Node.js, Docker) and configure `adapterPath` in `next.config.ts` if self-hosting.

---

*Concerns audit: 2026-05-16*
