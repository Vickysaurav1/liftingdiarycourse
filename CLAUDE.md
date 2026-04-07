# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16.2.2** with App Router (`src/app/`)
- **React 19.2.4**
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`)
- **TypeScript**

## Architecture

This is a Next.js App Router project. All routes and layouts live under `src/app/`. The entry point is `src/app/page.tsx` with `src/app/layout.tsx` as the root layout.

Next.js 16 may have breaking changes from earlier versions — check `node_modules/next/dist/docs/` before writing any Next.js-specific code.
