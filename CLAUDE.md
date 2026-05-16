<!-- GSD:project-start source:PROJECT.md -->
## Project

**Goodwell Service OS**

An all-in-one business management platform for the Goodwell.uz after-sales service center — a single branch of the Goodwell Group specializing in kitchen appliance repairs, spare parts management, and customer service in Central Asia. The platform replaces a fragmented mix of paper records, phone calls, and spreadsheets with a unified digital system covering the full service lifecycle: from customer intake through repair completion, parts tracking, invoicing, and management analytics.

**Core Value:** A master (technician) can open their phone, see their assigned jobs, check what spare parts are available for that appliance model, take a part from stock, and log it against the job — all without asking anyone or writing anything on paper.

### Constraints

- **Language**: Uzbek-first UI with Russian and English — all user-facing strings must be translatable via next-intl
- **Auth**: Phone number + OTP only — no email/password, no OAuth
- **Deployment**: Single-tenant — one installation for one service center branch
- **File storage**: BOM files (PDF + Excel) must be stored and served — requires file storage solution (local or cloud)
- **Offline**: No offline requirement — stable internet assumed at service center
- **Existing codebase**: Next.js 16 scaffold in `goodwell-service-os/` subdirectory — all new code lives there
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All application source code in `goodwell-service-os/src/`
- TSX (TypeScript + JSX) - React component files
- CSS - Global styles at `goodwell-service-os/src/app/globals.css`
- JavaScript (MJS) - Config files: `eslint.config.mjs`, `postcss.config.mjs`
## Runtime
- Node.js 20.x (v20.20.2 detected on host; no `.nvmrc` or `.node-version` pinning file present)
- npm 10.8.2
- Lockfile: `goodwell-service-os/package-lock.json` (lockfileVersion 3) - present
## Frameworks
- Next.js 16.2.6 - Full-stack React framework, App Router pattern (`goodwell-service-os/src/app/`)
- React 19.2.4 - UI rendering (`goodwell-service-os/src/app/layout.tsx`, `page.tsx`)
- React DOM 19.2.4 - DOM bindings
- Tailwind CSS 4.x (`@tailwindcss/postcss` ^4) - Utility-first CSS, configured via `postcss.config.mjs`
- CSS Custom Properties (design tokens) defined in `globals.css` via `@theme inline`
- Next.js built-in compiler (SWC) - No separate Babel config
- PostCSS with `@tailwindcss/postcss` plugin - `goodwell-service-os/postcss.config.mjs`
- ESLint 9.x - Linting via `goodwell-service-os/eslint.config.mjs`
## Key Dependencies
- `next` 16.2.6 - App framework; **note:** this is a non-standard major version (16.x). Per `AGENTS.md`, this version has breaking changes from standard Next.js. Read `node_modules/next/dist/docs/` before writing framework-specific code.
- `react` 19.2.4 - UI layer
- `react-dom` 19.2.4 - DOM rendering
- `tailwindcss` ^4 - Styling system
- `@tailwindcss/postcss` ^4 - PostCSS integration for Tailwind v4
- `typescript` ^5 - Type checking and compilation
- `@types/node` ^20, `@types/react` ^19, `@types/react-dom` ^19 - Type definitions
- `eslint` ^9 - Static analysis
- `eslint-config-next` 16.2.6 - Next.js ESLint rules
## Configuration
- Config: `goodwell-service-os/tsconfig.json`
- Target: ES2017
- Strict mode: enabled (`"strict": true`)
- Module resolution: `bundler`
- Path alias: `@/*` maps to `./src/*`
- No emit (Next.js handles compilation)
- JSX: `react-jsx` (no React import needed in JSX files)
- `goodwell-service-os/next.config.ts` - Currently empty (no custom configuration)
- `goodwell-service-os/postcss.config.mjs` - Registers `@tailwindcss/postcss` plugin
- No `.env` files present in project
- No environment variable usage detected in current source files
## Fonts
- Geist Sans and Geist Mono loaded via `next/font/google` in `goodwell-service-os/src/app/layout.tsx`
- Applied as CSS variables `--font-geist-sans` and `--font-geist-mono`
- Exposed to Tailwind via `@theme inline` in `globals.css`
## Platform Requirements
- Node.js 20.x
- npm 10.x
- Run from `goodwell-service-os/` subdirectory (not project root)
- Deployment target not yet configured
- Default Next.js standalone or Vercel deployment assumed (Vercel link present in `page.tsx`)
- No Docker, CI, or deployment config files detected at root or subdirectory level
## Project Layout Note
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Overview
## Naming Patterns
- Route segments: lowercase, hyphen-separated directory names (Next.js App Router convention)
- Config files: camelCase or dot-prefixed by ecosystem convention
- PascalCase named function exports: `export default function RootLayout(...)`, `export default function Home()`
- One default export per route file (enforced by Next.js App Router)
- camelCase for local variables and module-level constants: `geistSans`, `geistMono`
- CSS custom properties: kebab-case with `--` prefix: `--font-geist-sans`, `--color-background`
- Imported types use the `import type` syntax: `import type { Metadata } from "next"`
- Props typed as inline object literals with `Readonly<{...}>` for immutability
## Code Style
- No Prettier config present; formatting is enforced implicitly via ESLint and editor defaults
- Double quotes for JSX string attributes and import paths (observed in all existing files)
- Semicolons: present on all statements
- Trailing commas: used in multi-line object/array literals
- Tool: ESLint 9 (flat config format via `eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- This enforces: React hooks rules, Next.js-specific rules (Image, Link, Font), TypeScript strictness
- Run: `npm run lint` (invokes `eslint` from project root)
- Config: `goodwell-service-os/eslint.config.mjs`
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: `bundler` (Next.js Turbopack compatible)
- `isolatedModules: true` — each file must be independently compilable; no `const enum`
- `noEmit: true` — TypeScript is used for type checking only, not compilation
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/` prefix for all internal imports: `import { foo } from "@/lib/foo"`
- Use `import type` for type-only imports to keep runtime bundle clean
- Font imports from `next/font/google` at module level, not inside components
## Component Patterns
- All components are Server Components unless explicitly marked `"use client"`
- No `"use client"` or `"use server"` directives exist yet; add them only when needed
- `layout.tsx` exports a `RootLayout` with `Readonly<{ children: React.ReactNode }>` props
- Exported as a named `const metadata: Metadata` in layout/page files (not in a separate file)
- Example from `src/app/layout.tsx`:
- Use `next/font/google`, inject as CSS variable on `<html>` className
- Pattern from `src/app/layout.tsx`:
## Styling
## Error Handling
- Use `error.tsx` files per route segment for React error boundaries
- Use `not-found.tsx` for 404 handling
- Server actions: wrap in try/catch and return typed result objects, not throw
- API routes: return `Response` with appropriate HTTP status codes
## Logging
## Comments
- Complex business logic only
- Non-obvious workarounds must include a comment explaining why
- No JSDoc required for simple components
## Module Design
- Route files: single `export default` function (required by Next.js)
- Shared utilities: named exports preferred over default exports (easier to refactor)
- Not present yet; add `index.ts` barrels only when a directory has 3+ exports used elsewhere
## AGENTS.md Notice
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- App Router with React Server Components as the default rendering model
- All routing defined by directory structure under `goodwell-service-os/src/app/`
- Monorepo-style layout: git root contains the Next.js app in a dedicated subdirectory (`goodwell-service-os/`)
- Planned modular CRM with domain-separated feature areas (CRM, Orders, Warehouse, Finance, Staff, Reports)
- TypeScript strict mode throughout (`"strict": true` in tsconfig)
## Layers
- Purpose: Renders UI, handles routing via file-system conventions
- Location: `goodwell-service-os/src/app/`
- Contains: Page components (`page.tsx`), layout shells (`layout.tsx`), route segments
- Depends on: UI components (shadcn/ui, planned), tRPC client hooks (planned), next-intl (planned)
- Used by: End users via browser; Next.js router
- Purpose: Wraps all pages with shared HTML shell, fonts, and global styles
- Location: `goodwell-service-os/src/app/layout.tsx`
- Contains: `<html>` and `<body>` elements, Geist font variables, Tailwind antialiasing classes
- Depends on: `goodwell-service-os/src/app/globals.css`, `next/font/google`
- Used by: Every page in the application
- Purpose: Base CSS custom properties for theming (background/foreground), Tailwind import, dark mode media query
- Location: `goodwell-service-os/src/app/globals.css`
- Pattern: CSS variables defined on `:root`, `@theme inline` block maps vars to Tailwind tokens
- Fonts: `--font-geist-sans`, `--font-geist-mono` injected via layout
- Pattern: tRPC for type-safe client-server communication (declared in root `README.md`)
- Status: Not yet implemented — no `src/server/` or `src/trpc/` directories exist yet
- Expected location: `goodwell-service-os/src/server/` (routers) + `goodwell-service-os/src/app/api/trpc/` (HTTP handler)
- Pattern: PostgreSQL via Prisma ORM (declared in root `README.md`)
- Status: Not yet implemented — no `prisma/` directory or schema exists yet
- Expected location: `goodwell-service-os/prisma/schema.prisma`
- Pattern: next-intl for uz/ru/en multilingual support
- Status: Not yet implemented
- Expected location: locale-prefixed route groups, e.g. `goodwell-service-os/src/app/[locale]/`
## Data Flow
- No client-side state management library installed (no Zustand, Redux, Jotai)
- Expected pattern: React Server Components for data fetching; React state/context for local UI state; tRPC for server state
## Key Abstractions
- Purpose: Single HTML document shell shared across all routes
- Location: `goodwell-service-os/src/app/layout.tsx`
- Pattern: Next.js App Router `RootLayout` export; applies Geist font CSS variables as class names on `<html>`
- Purpose: Current placeholder home page
- Location: `goodwell-service-os/src/app/page.tsx`
- Pattern: Default export React Server Component; uses Tailwind utility classes for layout; uses `next/image` for optimised images
- Purpose: Light/dark mode colour tokens
- Location: `goodwell-service-os/src/app/globals.css`
- Pattern: CSS custom properties (`--background`, `--foreground`) on `:root`; `@theme inline` maps to Tailwind colour tokens (`--color-background`, `--color-foreground`); dark mode via `@media (prefers-color-scheme: dark)`
## Entry Points
- Command: `npm run dev` (from `goodwell-service-os/`)
- Triggers: `next dev`
- Serves: `http://localhost:3000`
- Location: `goodwell-service-os/src/app/page.tsx`
- Triggers: HTTP GET `/`
- Responsibilities: Renders landing/placeholder home page
- Location: `goodwell-service-os/src/app/layout.tsx`
- Triggers: Every route render
- Responsibilities: Injects fonts, global CSS, sets `<html lang>`, wraps children in `<body>`
- Location: `goodwell-service-os/next.config.ts`
- Current state: Empty config object — no custom settings yet
- Command: `npm run build` → `next build`
- Output: `goodwell-service-os/.next/` (generated, not committed)
## Error Handling
- No custom `error.tsx` or `not-found.tsx` files present yet
- Add `goodwell-service-os/src/app/error.tsx` for route-level error boundaries
- Add `goodwell-service-os/src/app/not-found.tsx` for 404 handling
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
