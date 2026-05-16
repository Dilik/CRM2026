# Coding Conventions

**Analysis Date:** 2026-05-16

## Overview

Early-stage scaffold built with Next.js 16 App Router, TypeScript (strict mode), and Tailwind CSS v4.
Source is currently limited to the bootstrap files; conventions are established by tooling config and
the two existing source files. All future code must follow these patterns.

## Naming Patterns

**Files:**
- Route segments: lowercase, hyphen-separated directory names (Next.js App Router convention)
  - e.g. `src/app/layout.tsx`, `src/app/page.tsx`
- Config files: camelCase or dot-prefixed by ecosystem convention
  - e.g. `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`

**React Components:**
- PascalCase named function exports: `export default function RootLayout(...)`, `export default function Home()`
- One default export per route file (enforced by Next.js App Router)

**Variables and Constants:**
- camelCase for local variables and module-level constants: `geistSans`, `geistMono`
- CSS custom properties: kebab-case with `--` prefix: `--font-geist-sans`, `--color-background`

**Types/Interfaces:**
- Imported types use the `import type` syntax: `import type { Metadata } from "next"`
- Props typed as inline object literals with `Readonly<{...}>` for immutability

## Code Style

**Formatting:**
- No Prettier config present; formatting is enforced implicitly via ESLint and editor defaults
- Double quotes for JSX string attributes and import paths (observed in all existing files)
- Semicolons: present on all statements
- Trailing commas: used in multi-line object/array literals

**Linting:**
- Tool: ESLint 9 (flat config format via `eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- This enforces: React hooks rules, Next.js-specific rules (Image, Link, Font), TypeScript strictness
- Run: `npm run lint` (invokes `eslint` from project root)
- Config: `goodwell-service-os/eslint.config.mjs`

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: `bundler` (Next.js Turbopack compatible)
- `isolatedModules: true` — each file must be independently compilable; no `const enum`
- `noEmit: true` — TypeScript is used for type checking only, not compilation

## Import Organization

**Path Alias:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/` prefix for all internal imports: `import { foo } from "@/lib/foo"`

**Order (follow Next.js ecosystem convention):**
1. External packages: `import type { Metadata } from "next"`, `import Image from "next/image"`
2. Internal aliases: `import "@/styles/globals.css"`
3. Relative imports: `import "./globals.css"`

**Style:**
- Use `import type` for type-only imports to keep runtime bundle clean
- Font imports from `next/font/google` at module level, not inside components

## Component Patterns

**Server Components (default in App Router):**
- All components are Server Components unless explicitly marked `"use client"`
- No `"use client"` or `"use server"` directives exist yet; add them only when needed
- `layout.tsx` exports a `RootLayout` with `Readonly<{ children: React.ReactNode }>` props

**Metadata:**
- Exported as a named `const metadata: Metadata` in layout/page files (not in a separate file)
- Example from `src/app/layout.tsx`:
  ```typescript
  export const metadata: Metadata = {
    title: "...",
    description: "...",
  };
  ```

**Font Loading:**
- Use `next/font/google`, inject as CSS variable on `<html>` className
- Pattern from `src/app/layout.tsx`:
  ```typescript
  const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
  // Applied as: className={`${geistSans.variable} ${geistMono.variable} ...`}
  ```

## Styling

**Framework:** Tailwind CSS v4 (imported via `@import "tailwindcss"` in CSS, not `@tailwind` directives)

**PostCSS:** `@tailwindcss/postcss` plugin — config at `goodwell-service-os/postcss.config.mjs`

**CSS Variables:** Defined in `:root` in `goodwell-service-os/src/app/globals.css`; theme tokens
exposed via `@theme inline { ... }` block (Tailwind v4 syntax).

**Dark Mode:** Handled via `@media (prefers-color-scheme: dark)` on `:root` — not via a `dark:` class
on `<html>`. Tailwind `dark:` variants still work via Tailwind v4's automatic detection.

**Utility-first:** All layout and spacing done via Tailwind utility classes in JSX. No CSS modules.
Use Tailwind classes directly; avoid inline `style=` props unless values are dynamic/computed.

**Zinc color scale** used for neutral grays: `bg-zinc-50`, `text-zinc-600`, `text-zinc-950`.

## Error Handling

No error handling patterns established yet (scaffold only).

**Future guidance (align with Next.js App Router):**
- Use `error.tsx` files per route segment for React error boundaries
- Use `not-found.tsx` for 404 handling
- Server actions: wrap in try/catch and return typed result objects, not throw
- API routes: return `Response` with appropriate HTTP status codes

## Logging

No logging framework configured. Use `console.error` for development-only debugging.
Do not leave `console.log` in committed code.

## Comments

**When to Comment:**
- Complex business logic only
- Non-obvious workarounds must include a comment explaining why
- No JSDoc required for simple components

**Existing pattern:** No inline comments in source files (clean scaffold).

## Module Design

**Exports:**
- Route files: single `export default` function (required by Next.js)
- Shared utilities: named exports preferred over default exports (easier to refactor)

**Barrel Files:**
- Not present yet; add `index.ts` barrels only when a directory has 3+ exports used elsewhere

## AGENTS.md Notice

`goodwell-service-os/AGENTS.md` (and `CLAUDE.md`) states:
> "This is NOT the Next.js you know. Read `node_modules/next/dist/docs/` before writing any code."

This means Next.js 16 may have breaking API changes from Next.js 14/15. Always read the bundled
docs at `goodwell-service-os/node_modules/next/dist/docs/` before implementing new Next.js features.

---

*Convention analysis: 2026-05-16*
