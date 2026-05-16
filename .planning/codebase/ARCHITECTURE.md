# Architecture

**Analysis Date:** 2026-05-16

## Pattern Overview

**Overall:** Next.js 16 App Router — file-system-driven, server-component-first architecture

**Key Characteristics:**
- App Router with React Server Components as the default rendering model
- All routing defined by directory structure under `goodwell-service-os/src/app/`
- Monorepo-style layout: git root contains the Next.js app in a dedicated subdirectory (`goodwell-service-os/`)
- Planned modular CRM with domain-separated feature areas (CRM, Orders, Warehouse, Finance, Staff, Reports)
- TypeScript strict mode throughout (`"strict": true` in tsconfig)

**IMPORTANT — Non-Standard Next.js Version:**
`AGENTS.md` explicitly warns that Next.js 16.2.6 used here has breaking changes from prior versions. Always read `goodwell-service-os/node_modules/next/dist/docs/` before writing routing, API, or rendering code. Do not assume standard Next.js 13/14/15 conventions apply.

## Layers

**Presentation / Page Layer:**
- Purpose: Renders UI, handles routing via file-system conventions
- Location: `goodwell-service-os/src/app/`
- Contains: Page components (`page.tsx`), layout shells (`layout.tsx`), route segments
- Depends on: UI components (shadcn/ui, planned), tRPC client hooks (planned), next-intl (planned)
- Used by: End users via browser; Next.js router

**Root Layout:**
- Purpose: Wraps all pages with shared HTML shell, fonts, and global styles
- Location: `goodwell-service-os/src/app/layout.tsx`
- Contains: `<html>` and `<body>` elements, Geist font variables, Tailwind antialiasing classes
- Depends on: `goodwell-service-os/src/app/globals.css`, `next/font/google`
- Used by: Every page in the application

**Global Styles:**
- Purpose: Base CSS custom properties for theming (background/foreground), Tailwind import, dark mode media query
- Location: `goodwell-service-os/src/app/globals.css`
- Pattern: CSS variables defined on `:root`, `@theme inline` block maps vars to Tailwind tokens
- Fonts: `--font-geist-sans`, `--font-geist-mono` injected via layout

**API Layer (Planned):**
- Pattern: tRPC for type-safe client-server communication (declared in root `README.md`)
- Status: Not yet implemented — no `src/server/` or `src/trpc/` directories exist yet
- Expected location: `goodwell-service-os/src/server/` (routers) + `goodwell-service-os/src/app/api/trpc/` (HTTP handler)

**Data Layer (Planned):**
- Pattern: PostgreSQL via Prisma ORM (declared in root `README.md`)
- Status: Not yet implemented — no `prisma/` directory or schema exists yet
- Expected location: `goodwell-service-os/prisma/schema.prisma`

**Internationalisation Layer (Planned):**
- Pattern: next-intl for uz/ru/en multilingual support
- Status: Not yet implemented
- Expected location: locale-prefixed route groups, e.g. `goodwell-service-os/src/app/[locale]/`

## Data Flow

**Current (Scaffold State):**

1. Browser requests a URL
2. Next.js router matches file path under `src/app/`
3. `layout.tsx` renders HTML shell with font CSS variables
4. `page.tsx` (React Server Component) renders page content
5. Static HTML returned to browser; Tailwind CSS applied client-side

**Planned (Full CRM Flow):**

1. Browser requests a locale-prefixed URL (e.g. `/uz/orders`)
2. next-intl middleware resolves locale and injects translations
3. Layout shell renders with auth session check
4. Page Server Component calls tRPC procedure via server-side caller
5. tRPC router invokes Prisma query against PostgreSQL
6. Data returned through tRPC, typed end-to-end, rendered into React components

**State Management:**
- No client-side state management library installed (no Zustand, Redux, Jotai)
- Expected pattern: React Server Components for data fetching; React state/context for local UI state; tRPC for server state

## Key Abstractions

**Root Layout (`RootLayout`):**
- Purpose: Single HTML document shell shared across all routes
- Location: `goodwell-service-os/src/app/layout.tsx`
- Pattern: Next.js App Router `RootLayout` export; applies Geist font CSS variables as class names on `<html>`

**Page Component (`Home`):**
- Purpose: Current placeholder home page
- Location: `goodwell-service-os/src/app/page.tsx`
- Pattern: Default export React Server Component; uses Tailwind utility classes for layout; uses `next/image` for optimised images

**CSS Theme System:**
- Purpose: Light/dark mode colour tokens
- Location: `goodwell-service-os/src/app/globals.css`
- Pattern: CSS custom properties (`--background`, `--foreground`) on `:root`; `@theme inline` maps to Tailwind colour tokens (`--color-background`, `--color-foreground`); dark mode via `@media (prefers-color-scheme: dark)`

## Entry Points

**Development Server:**
- Command: `npm run dev` (from `goodwell-service-os/`)
- Triggers: `next dev`
- Serves: `http://localhost:3000`

**Root Page:**
- Location: `goodwell-service-os/src/app/page.tsx`
- Triggers: HTTP GET `/`
- Responsibilities: Renders landing/placeholder home page

**Root Layout:**
- Location: `goodwell-service-os/src/app/layout.tsx`
- Triggers: Every route render
- Responsibilities: Injects fonts, global CSS, sets `<html lang>`, wraps children in `<body>`

**Next.js Config:**
- Location: `goodwell-service-os/next.config.ts`
- Current state: Empty config object — no custom settings yet

**Build:**
- Command: `npm run build` → `next build`
- Output: `goodwell-service-os/.next/` (generated, not committed)

## Error Handling

**Strategy:** Not yet implemented — default Next.js error boundaries only

**Patterns:**
- No custom `error.tsx` or `not-found.tsx` files present yet
- Add `goodwell-service-os/src/app/error.tsx` for route-level error boundaries
- Add `goodwell-service-os/src/app/not-found.tsx` for 404 handling

## Cross-Cutting Concerns

**Logging:** Not implemented — no logging library installed
**Validation:** Not implemented — no Zod or validation library present (expected with tRPC)
**Authentication:** Not implemented — no auth library present (next-auth or similar expected for CRM)
**Internationalisation:** Planned via next-intl — not yet scaffolded

---

*Architecture analysis: 2026-05-16*
