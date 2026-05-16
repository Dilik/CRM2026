# Codebase Structure

**Analysis Date:** 2026-05-16

## Directory Layout

```
GoodwellCRM2026/                        # Git repository root
├── .git/                               # Git internals
├── .planning/                          # GSD planning documents
│   └── codebase/                       # Codebase analysis docs (this directory)
├── goodwell-service-os/                # Main Next.js application
│   ├── .next/                          # Build output (generated, gitignored)
│   ├── node_modules/                   # Dependencies (gitignored)
│   ├── public/                         # Static assets served at /
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── src/
│   │   └── app/                        # Next.js App Router root
│   │       ├── favicon.ico
│   │       ├── globals.css             # Global styles + Tailwind import
│   │       ├── layout.tsx              # Root layout (HTML shell, fonts)
│   │       └── page.tsx               # Home page route (/)
│   ├── AGENTS.md                       # AI agent constraints (non-standard Next.js warning)
│   ├── CLAUDE.md                       # Claude-specific pointer → @AGENTS.md
│   ├── README.md                       # Next.js bootstrap readme
│   ├── eslint.config.mjs               # ESLint flat config (Next.js + TypeScript)
│   ├── next-env.d.ts                   # Next.js TypeScript declarations (generated)
│   ├── next.config.ts                  # Next.js config (currently empty)
│   ├── package.json                    # Dependencies and scripts
│   ├── package-lock.json               # Lockfile
│   ├── postcss.config.mjs              # PostCSS with @tailwindcss/postcss plugin
│   └── tsconfig.json                   # TypeScript config (strict, bundler resolution)
└── README.md                           # Project overview (stack, modules, quick start)
```

## Directory Purposes

**`GoodwellCRM2026/` (git root):**
- Purpose: Repository container; holds the Next.js app in a named subdirectory
- Key files: `README.md` (authoritative project overview with planned stack and modules)

**`goodwell-service-os/` (Next.js app root):**
- Purpose: All application code, config, and dependencies live here
- All `npm` commands must be run from inside this directory
- Key files: `package.json`, `next.config.ts`, `tsconfig.json`

**`goodwell-service-os/src/app/` (App Router root):**
- Purpose: Next.js file-system routing — every subdirectory becomes a URL segment
- Contains: Layouts, pages, route handlers, loading/error boundaries
- Currently: Only root layout and home page exist

**`goodwell-service-os/public/` (static assets):**
- Purpose: Files served directly at the root URL without processing
- Access pattern: `/next.svg` maps to `public/next.svg`
- Contains: SVG icons only (placeholder assets from create-next-app)

**`.planning/codebase/` (GSD planning):**
- Purpose: Codebase analysis documents for GSD planning commands
- Generated: By `/gsd-map-codebase` — do not edit manually
- Committed: Yes

## Key File Locations

**Entry Points:**
- `goodwell-service-os/src/app/layout.tsx`: Root layout — wraps every page
- `goodwell-service-os/src/app/page.tsx`: Home route `/`

**Configuration:**
- `goodwell-service-os/next.config.ts`: Next.js configuration
- `goodwell-service-os/tsconfig.json`: TypeScript settings (`@/*` path alias → `./src/*`)
- `goodwell-service-os/eslint.config.mjs`: ESLint flat config
- `goodwell-service-os/postcss.config.mjs`: Tailwind CSS PostCSS integration

**Styles:**
- `goodwell-service-os/src/app/globals.css`: CSS custom properties, Tailwind import, dark mode

**Agent Constraints:**
- `goodwell-service-os/AGENTS.md`: Read before writing any Next.js code — non-standard version warning
- `goodwell-service-os/CLAUDE.md`: Points to AGENTS.md via `@AGENTS.md`

**Project Documentation:**
- `GoodwellCRM2026/README.md`: Authoritative planned stack and CRM module list

## Naming Conventions

**Files:**
- Page files: `page.tsx` (required by Next.js App Router)
- Layout files: `layout.tsx` (required by Next.js App Router)
- Components (planned): PascalCase, e.g. `ServiceOrderCard.tsx`
- Utilities (planned): camelCase, e.g. `formatCurrency.ts`
- CSS: `kebab-case.css`

**Directories:**
- Route segments: lowercase, e.g. `orders/`, `customers/`
- Route groups (planned): parentheses notation, e.g. `(auth)/`, `(dashboard)/`
- Locale segments (planned): bracket notation, e.g. `[locale]/`
- Feature modules (planned): match business domain names from README — `crm/`, `orders/`, `warehouse/`, `finance/`, `staff/`, `reports/`

**Exports:**
- Page and layout components: `export default function` (required by Next.js)
- Metadata: `export const metadata` in page/layout files

## Where to Add New Code

**New Route / Page:**
- Create directory under `goodwell-service-os/src/app/[route-name]/`
- Add `page.tsx` with default-exported React component
- Add `layout.tsx` if the route needs its own layout shell

**New Feature Module (CRM domain):**
- Route pages: `goodwell-service-os/src/app/[locale]/[module-name]/page.tsx`
- Shared UI components: `goodwell-service-os/src/components/[module-name]/` (create when first component is added)
- Server logic / tRPC routers (planned): `goodwell-service-os/src/server/routers/[module-name].ts`
- Type definitions (planned): `goodwell-service-os/src/types/[module-name].ts`

**New Shared Component:**
- Implementation: `goodwell-service-os/src/components/ui/` (shadcn/ui pattern, planned)
- Custom shared: `goodwell-service-os/src/components/[component-name].tsx`

**Utilities / Helpers:**
- Shared helpers: `goodwell-service-os/src/lib/` (create when first utility is added)

**Database Schema (Prisma, planned):**
- Schema: `goodwell-service-os/prisma/schema.prisma`
- Migrations: `goodwell-service-os/prisma/migrations/`

**Internationalisation Messages (planned):**
- Translation files: `goodwell-service-os/messages/[locale].json` (uz.json, ru.json, en.json)

**Static Assets:**
- Public images/icons: `goodwell-service-os/public/[filename]`

**Tests (planned):**
- Co-locate with source: `goodwell-service-os/src/[path]/[file].test.tsx`

## Special Directories

**`goodwell-service-os/.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes (by `next build` / `next dev`)
- Committed: No (in `.gitignore`)

**`goodwell-service-os/node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)
- Note: `node_modules/next/dist/docs/` contains Next.js 16 documentation — read before using Next.js APIs

**`.planning/`:**
- Purpose: GSD command outputs — architecture, stack, conventions, concerns docs
- Generated: By `/gsd-map-codebase` commands
- Committed: Yes

## Path Aliases

**Configured in `goodwell-service-os/tsconfig.json`:**
- `@/*` → `./src/*`
- Example: `import { Button } from "@/components/ui/button"` resolves to `src/components/ui/button`

---

*Structure analysis: 2026-05-16*
