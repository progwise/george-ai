# Copilot Instructions for George AI Codebase

## Architecture Overview

- **Monorepo** managed with `pnpm` workspaces. Major app directories:
  - `apps/georgeai-web`: Astro frontend (Tailwindcss, Astro actions)
  - `apps/georgeai-webapp`: React frontend (TanStack Router, Vite, GraphQL)
  - `apps/georgeai-backend`: Node.js GraphQL backend (Pothos, Prisma)
  - `apps/webcrawler`: Python FastAPI microservice for crawling
  - `apps/smb-test-server`: Docker-based SMB test server for file share integration
  - `packages/`: Shared libraries (GraphQL schema, file management, utils, etc.)
- **Data flow:** Frontend ↔ GraphQL API (georgeai-backend) ↔ PostgreSQL (via Prisma)
- **Authentication:** Keycloak (OIDC) for user/session management

## Developer Workflows

- **Install dependencies:** `pnpm install` (from root)
- **Start all services:** `pnpm dev` (from root; starts backend and frontend)
- **Start individually:**
  - Backend: `cd apps/georgeai-backend && pnpm dev`
  - Frontend: `cd apps/georgeai-webapp && pnpm dev`
- **Prisma (DB):**
  - Migrate: `cd packages/pothos-graphql && pnpm prisma migrate dev`
  - Generate client: `pnpm prisma generate`
- **Codegen (GraphQL):** `cd apps/georgeai-webapp && pnpm codegen`
- **Lint/Format:** `pnpm lint`, `pnpm format` (run before commit)
- **Testing:**
  - E2E: `cd e2e-tests && pnpm test`
  - Playwright for browser automation
- **SMB Test Server:** Auto-starts in devcontainer; see `apps/smb-test-server/README.md` for test users and shares

## Project Conventions & Patterns

- **No semicolons**; always use trailing commas (see `.prettierrc`)
- **.env files** required in each app/package for local dev; use `.env.example` as template
- **GraphQL schema** is defined in `packages/pothos-graphql`
- **Shared code** lives in `packages/`
- **Frontend routing**: TanStack Router, see `apps/georgeai-webapp/src/router.tsx`
- **Backend API**: Pothos GraphQL, see `apps/georgeai-backend/src/server.ts`

## Integration Points

- **Keycloak**: OIDC, see `.env.example` for config
- **Typesense**: Search, see `.env.example`
- **Google Drive**: Optional integration, see `.env.example`
- **SMB**: File shares for ingestion/testing, see `apps/smb-test-server`

## Examples

- To add a new GraphQL type: edit `packages/pothos-graphql/src/` and regenerate types
- To add a new frontend route: edit `apps/georgeai-webapp/app/routes/`
- To add a new backend API: edit `apps/georgeai-backend/src/`

## References

- See root `README.md` for setup, ports, and environment details
- See `.claude/CLAUDE.md` for additional agent guidance
- See each app/package `README.md` for specifics

---

_If any section is unclear or missing, please provide feedback for improvement._
