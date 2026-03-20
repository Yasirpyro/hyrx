# Copilot Instructions for `ai-email-assistant` (Agent Library Work)

## Current baseline
- This repo is a React + Vite + TypeScript + Tailwind + shadcn marketing site; Agent Library is a new feature area.
- Follow existing app shell and providers in `src/App.tsx` (Helmet, QueryClient, Router, Theme, SmoothScroll).
- Treat `.claude/agents/AGENT.md` as product intent; align implementation to real patterns already used in `src/`.

## Where to add Agent Library code
- Use feature-sliced structure for new work:
  - `src/features/agents/components/*` for feature UI (PromptCard, filters, switchers, export actions).
  - `src/hooks/*` for reusable behavior (`useAgentFilters`, save/rating hooks).
  - `src/pages/*` (and nested folders) for route-level pages (`/agents`, `/agents/:slug`, index pages).
  - `src/types/agents.ts` for zod schemas + inferred types.
- Keep shared primitives in existing `src/components/ui/*`; avoid duplicating base controls.

## Routing + SEO requirements
- Register all new routes in `src/App.tsx`.
- Every route-level Agent page must use `Layout` + `SEO` (`src/components/SEO.tsx`).
- Include canonical URLs and breadcrumb/schema where useful, following existing page patterns (see `src/pages/BlogPost.tsx`).
- Keep filtered list views URL-driven (`useSearchParams`) for shareable state.

## Supabase implementation rules
- Put schema changes in `supabase/migrations/*.sql`; keep SQL and frontend types in the same PR.
- After schema changes, regenerate `src/integrations/supabase/types.ts` and keep `src/types/agents.ts` zod schemas consistent.
- Use `src/integrations/supabase/client.ts` for all DB calls.
- Validate runtime payloads/responses with zod where data crosses trust boundaries (pattern already used in edge function).
- If adding RPC (e.g., rating aggregates), define SQL migration + typed frontend call together.

## UI + styling conventions
- Use `@` imports and `cn` from `src/lib/utils.ts`.
- Reuse design tokens/utilities in `src/index.css` (`container-main`, `section`, `glass`, gradient utilities); do not introduce new theme systems.
- Reuse existing toast stack (`use-toast`, `sonner`) and existing motion style (`Reveal`, framer-motion patterns).

## Build, test, deploy workflow
- `npm i`, `npm run dev` (port 8080), `npm run lint`, `npm run build`, `npm run preview`.
- Cloudflare SPA deployment is configured via `wrangler.jsonc` (`assets.not_found_handling = "single-page-application"`).
- Frontend env must stay in `import.meta.env.*`; never hardcode secrets/keys.

## Scope and safety guardrails
- Implement only requested Agent Library scope; do not add auth/admin/newsletter flows unless explicitly asked.
- Preserve existing contact flow (`src/pages/Contact.tsx` + `supabase/functions/send-contact-email`) when touching shared infra.
- Keep changes incremental and reviewable: schema/types/hooks/components/pages/routes in clear sequence.