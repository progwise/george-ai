# Copilot Instructions for George AI Codebase

## Architecture Overview
- **Monorepo** managed with `pnpm` workspaces. Major app directories:
  - `apps/chat-web`: React frontend (TanStack Router, Vite, GraphQL)
  - `apps/georgeai-server`: Node.js GraphQL backend (Pothos, Prisma)
  - `apps/crawler-server`: Python FastAPI microservice for crawling
  - `apps/smb-test-server`: Docker-based SMB test server for file share integration
  - `packages/`: Shared libraries (GraphQL schema, file management, utils, etc.)
- **Data flow:** Frontend ↔ GraphQL API (georgeai-server) ↔ PostgreSQL (via Prisma)
- **Authentication:** Keycloak (OIDC) for user/session management
- **Crawling/Enrichment:** `crawler-server` and enrichment queues for ingesting external data/files

## Developer Workflows
- **Install dependencies:** `pnpm install` (from root)
- **Start all services:** `pnpm dev` (from root; starts backend and frontend)
- **Start individually:**
  - Backend: `cd apps/georgeai-server && pnpm dev`
  - Frontend: `cd apps/chat-web && pnpm dev`
- **Prisma (DB):**
  - Migrate: `cd packages/pothos-graphql && pnpm prisma migrate dev`
  - Generate client: `pnpm prisma generate`
- **Codegen (GraphQL):** `cd apps/chat-web && pnpm codegen`
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
- **Frontend routing**: TanStack Router, see `apps/chat-web/app/router.tsx`
- **Backend API**: Pothos GraphQL, see `apps/georgeai-server/src/server.ts`
- **Crawling/Enrichment**: Python FastAPI, see `apps/crawler-server/src/main.py`

## Integration Points
- **Keycloak**: OIDC, see `.env.example` for config
- **Typesense**: Search, see `.env.example`
- **Google Drive**: Optional integration, see `.env.example`
- **SMB**: File shares for ingestion/testing, see `apps/smb-test-server`

## Examples
- To add a new GraphQL type: edit `packages/pothos-graphql/src/` and regenerate types
- To add a new frontend route: edit `apps/chat-web/app/routes/`
- To add a new backend API: edit `apps/georgeai-server/src/`

## References
- See root `README.md` for setup, ports, and environment details
- See `CLAUDE.md` for additional agent guidance
- See each app/package `README.md` for specifics

---

_If any section is unclear or missing, please provide feedback for improvement._
