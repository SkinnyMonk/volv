# Copilot Instructions for Thak

## Project Overview

**Thak** is a Next.js 16 project using:
- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Linting**: ESLint v9 with Next.js config
- **Runtime**: React 19.2.0

This is a bootstrapped `create-next-app` project in early stages.

## Architecture & File Structure

```
app/               # Next.js App Router (server-first)
├── layout.tsx    # Root layout with font imports (Geist Sans/Mono)
├── page.tsx      # Home page (/)
└── globals.css   # Global Tailwind styles
public/           # Static assets
```

### Key Architectural Patterns

- **App Router**: Use `app/` directory for routes. Pages are default exports in `page.tsx`.
- **Server Components by Default**: Unless `"use client"` is present, components are React Server Components.
- **Metadata**: Define via `Metadata` export in layout.tsx or page.tsx files.
- **Font Loading**: Geist fonts are pre-configured in `app/layout.tsx` with CSS variables `--font-geist-sans` and `--font-geist-mono`.

## Development Workflow

### Common Commands

```bash
npm run dev      # Start dev server (localhost:3000, hot reload)
npm run build    # Production build to .next/
npm start        # Run production build
npm run lint     # Run ESLint v9 on codebase
```

### TypeScript Configuration

- **Path Alias**: `@/*` resolves to project root (e.g., `import { Foo } from "@/components/foo"`)
- **Strict Mode**: Enabled (`"strict": true`)
- **No Emit**: TypeScript compilation handled by Next.js
- **Module**: `esnext` with `bundler` resolution

### Linting Standards

ESLint config in `eslint.config.mjs` (flat config format):
- Uses `eslint-config-next/core-web-vitals` (performance, accessibility, best practices)
- Uses `eslint-config-next/typescript` (TypeScript-specific rules)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

When linting, run: `npm run lint`

## Styling & CSS

- **Tailwind CSS v4**: Uses PostCSS (`postcss.config.mjs`) with `@tailwindcss/postcss`
- **Global Styles**: `app/globals.css` imports Tailwind directives
- **Font Variables**: Custom CSS variables for Geist fonts available via `font-geist-sans` and `font-geist-mono` classes

## When Adding Code

1. **Pages/Routes**: Create `app/[route]/page.tsx` with default export
2. **Components**: Keep reusable components in a `components/` folder (create if needed)
3. **Server vs Client**: Default to Server Components; add `"use client"` at the top of files needing interactivity (hooks, event listeners)
4. **Type Safety**: Leverage `React.ReactNode`, `Metadata` type for consistency with `app/layout.tsx`
5. **Styling**: Use Tailwind utility classes; avoid inline styles when possible

## Code Documentation Rule

**⚠️ IMPORTANT**: Do NOT create any `.md`, `.txt`, `README`, or documentation files. Only write code files. No summaries, guides, or explanatory documents.

## Build & Deployment

- **Output**: Production build in `.next/` directory
- **Ignore Patterns**: See `.gitignore` (includes `.next/`, `node_modules/`, `.env*`)
- **Target**: Node.js target is ES2017; browser libs include DOM APIs

## Useful Context

- **Early Stage**: Project scaffolding is minimal; expect to add components, API routes, etc.
- **No API Routes Yet**: Add API handlers in `app/api/` as needed
- **No Testing Configured**: Consider Jest + React Testing Library if tests are required
- **Vercel Platform**: README suggests Vercel for deployment (native Next.js support)


## Development Environment Notes

- The development server (`npm run dev`) is **already running manually** on localhost.
- **Never start or restart** the development server as part of validation, testing, or build verification.
- When validating code or checking for errors, **only perform static validation** (lint, type-check, or dry-run builds if needed).
- Do **not** execute `npm run dev`, `npm run build`, or `next dev`.
- If you need to ensure type safety, you may run:
  ```bash
  npm run type-check || true

