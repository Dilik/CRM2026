# Technology Stack

**Analysis Date:** 2026-05-16

## Languages

**Primary:**
- TypeScript 5.x - All application source code in `goodwell-service-os/src/`
- TSX (TypeScript + JSX) - React component files

**Secondary:**
- CSS - Global styles at `goodwell-service-os/src/app/globals.css`
- JavaScript (MJS) - Config files: `eslint.config.mjs`, `postcss.config.mjs`

## Runtime

**Environment:**
- Node.js 20.x (v20.20.2 detected on host; no `.nvmrc` or `.node-version` pinning file present)

**Package Manager:**
- npm 10.8.2
- Lockfile: `goodwell-service-os/package-lock.json` (lockfileVersion 3) - present

## Frameworks

**Core:**
- Next.js 16.2.6 - Full-stack React framework, App Router pattern (`goodwell-service-os/src/app/`)
- React 19.2.4 - UI rendering (`goodwell-service-os/src/app/layout.tsx`, `page.tsx`)
- React DOM 19.2.4 - DOM bindings

**Styling:**
- Tailwind CSS 4.x (`@tailwindcss/postcss` ^4) - Utility-first CSS, configured via `postcss.config.mjs`
- CSS Custom Properties (design tokens) defined in `globals.css` via `@theme inline`

**Build/Dev:**
- Next.js built-in compiler (SWC) - No separate Babel config
- PostCSS with `@tailwindcss/postcss` plugin - `goodwell-service-os/postcss.config.mjs`
- ESLint 9.x - Linting via `goodwell-service-os/eslint.config.mjs`
  - `eslint-config-next/core-web-vitals` ruleset
  - `eslint-config-next/typescript` ruleset

## Key Dependencies

**Critical:**
- `next` 16.2.6 - App framework; **note:** this is a non-standard major version (16.x). Per `AGENTS.md`, this version has breaking changes from standard Next.js. Read `node_modules/next/dist/docs/` before writing framework-specific code.
- `react` 19.2.4 - UI layer
- `react-dom` 19.2.4 - DOM rendering

**Infrastructure (devDependencies):**
- `tailwindcss` ^4 - Styling system
- `@tailwindcss/postcss` ^4 - PostCSS integration for Tailwind v4
- `typescript` ^5 - Type checking and compilation
- `@types/node` ^20, `@types/react` ^19, `@types/react-dom` ^19 - Type definitions
- `eslint` ^9 - Static analysis
- `eslint-config-next` 16.2.6 - Next.js ESLint rules

## Configuration

**TypeScript:**
- Config: `goodwell-service-os/tsconfig.json`
- Target: ES2017
- Strict mode: enabled (`"strict": true`)
- Module resolution: `bundler`
- Path alias: `@/*` maps to `./src/*`
- No emit (Next.js handles compilation)
- JSX: `react-jsx` (no React import needed in JSX files)

**Build:**
- `goodwell-service-os/next.config.ts` - Currently empty (no custom configuration)
- `goodwell-service-os/postcss.config.mjs` - Registers `@tailwindcss/postcss` plugin

**Environment Variables:**
- No `.env` files present in project
- No environment variable usage detected in current source files

**Scripts:**
```bash
npm run dev      # next dev — development server
npm run build    # next build — production build
npm run start    # next start — production server
npm run lint     # eslint — lint source files
```

## Fonts

- Geist Sans and Geist Mono loaded via `next/font/google` in `goodwell-service-os/src/app/layout.tsx`
- Applied as CSS variables `--font-geist-sans` and `--font-geist-mono`
- Exposed to Tailwind via `@theme inline` in `globals.css`

## Platform Requirements

**Development:**
- Node.js 20.x
- npm 10.x
- Run from `goodwell-service-os/` subdirectory (not project root)

**Production:**
- Deployment target not yet configured
- Default Next.js standalone or Vercel deployment assumed (Vercel link present in `page.tsx`)
- No Docker, CI, or deployment config files detected at root or subdirectory level

## Project Layout Note

The repository root `/GoodwellCRM2026/` contains only a `README.md` and the `goodwell-service-os/` subdirectory. All application code, dependencies, and configuration live under `goodwell-service-os/`.

---

*Stack analysis: 2026-05-16*
