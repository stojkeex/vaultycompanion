# Vaulty

Elite AI specialized companions and premium messaging platform.

## Run & Operate

- `pnpm --filter @workspace/vaulty run dev` — run the Vaulty app (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, Wouter (routing), TanStack Query
- Auth & Data: Firebase (Firestore, Auth, Storage)
- Payments: Stripe
- DB: PostgreSQL + Drizzle ORM (for API server)
- Build: Vite (frontend), esbuild (API server CJS bundle)

## Where things live

- `artifacts/vaulty/` — Vaulty React frontend (main app)
  - `src/` — React source code (pages, components, contexts, hooks, lib)
  - `src/lib/firebase.ts` — Firebase config
  - `src/pages/` — app pages (home, chat, profile, premium, live, etc.)
  - `shared/` — shared schema (Drizzle/Zod)
  - `public/` — static assets (badges, ranks, music, favicon)
- `artifacts/api-server/` — Express 5 API server
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — Drizzle database schema

## Architecture decisions

- Vaulty is primarily a Firebase-backed SPA — most data lives in Firestore, not PostgreSQL.
- The app was imported from an existing Replit project via zip archive.
- Frontend runs as a pure Vite SPA (no Express middleware) using the workspace's react-vite scaffold.
- `@shared` alias maps to `artifacts/vaulty/shared/` for Drizzle/Zod types.
- `@assets` alias maps to workspace root `attached_assets/` for images.

## Product

Vaulty is a premium AI companion platform featuring:
- Firebase auth (email/password, social login)
- AI companion chat & live interactions
- Premium subscription tiers with Stripe
- Leaderboards, ranks, badges
- User profiles, goals, news feed
- Academy, quests, support

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase credentials must be configured in `src/lib/firebase.ts` — the app won't connect to Firebase without valid config.
- Stripe publishable key is needed for payment features.
- The `attached_assets/` folder at workspace root contains uploaded user images referenced by the app.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
