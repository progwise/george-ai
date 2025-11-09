# George AI E2E-Tests

This repository contains end-to-end tests for the George AI project.

## Architecture

The E2E test environment uses Docker Compose to run all required services:

- **gai-e2e-backend-db**: PostgreSQL database (local, isolated per test run)
- **gai-e2e-typesense**: Typesense vector search (local, isolated per test run)
- **gai-e2e-backend**: Backend API (built from current code)
- **gai-e2e-webapp**: Frontend application (built from current code)
- **gai-e2e-web**: Marketing website (built from current code)

**Shared Services (no local setup needed):**

- **Keycloak**: Uses `keycloak.george-ai.net` with test realm `george-ai-e2e-test`
- **Ollama**: Optional remote instance for AI-dependent tests

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 22+
- pnpm 9.15.4+

### Setup

1. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your test credentials (E2E_USERNAME, E2E_PASSWORD)

2. **Start all services**

   ```bash
   docker compose up -d
   ```

   This will:
   - Start PostgreSQL and Typesense
   - Build and start backend, webapp, and web
   - Wait for all services to be healthy

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Install Playwright browsers**

   ```bash
   pnpm playwright install
   ```

5. **Run the tests**

   ```bash
   pnpm test
   ```

### Development Workflow

```bash
# Start services
docker compose up -d

# Watch logs
docker compose logs -f

# Run tests
pnpm test

# Run tests in UI mode
pnpm test:ui

# Stop services
docker compose down

# Stop and remove volumes (clean state)
docker compose down -v
```

### Troubleshooting

**Services not starting:**

```bash
# Check service status
docker compose ps

# View logs for specific service
docker compose logs gai-e2e-backend
docker compose logs gai-e2e-webapp

# Restart services
docker compose restart
```

**Database issues:**

```bash
# Reset database (removes all data)
docker compose down -v
docker compose up -d
```

**Port conflicts:**
If ports 3001, 3003, 4321, 5432, or 8108 are already in use, stop conflicting services or modify port mappings in `docker-compose.yml`

## Keycloak Setup

The E2E tests use a shared Keycloak instance at `keycloak.george-ai.net` with a dedicated test realm.

### One-Time Setup (Manual Import)

1. **Login to Keycloak Admin Console**

   ```
   URL: https://keycloak.george-ai.net
   Username: admin
   Password: [admin password]
   ```

2. **Import the E2E Test Realm**
   - Click "Create Realm" (or select realm dropdown)
   - Click "Browse" and select `keycloak-realm-e2e-test.json`
   - Click "Create"

3. **Verify the realm was imported**
   - Realm name: `george-ai-e2e-test`
   - Client: `george-ai-e2e`
   - Test user: `e2e-test-user@example.com`
   - Password: `E2ETestPassword123!`

**Note:** The realm export includes a pre-configured test user. You can use this user for local testing and CI.

### Client Configuration

The `george-ai-e2e` client is configured with:

- **Redirect URIs**: `http://localhost:3001/*`, `https://george-ai.net/*`
- **Web Origins**: `http://localhost:3001`, `https://george-ai.net`
- **Public Client**: Yes (no client secret required)
- **Direct Access Grants**: Enabled (for programmatic login)

## CI/CD

The same docker-compose setup is used in GitHub Actions CI pipeline. See `.github/workflows/e2e-tests.yml` for the CI configuration.

Environment variables for CI are stored in GitHub Secrets:

- `E2E_USERNAME` (default: `e2e-test-user@example.com`)
- `E2E_PASSWORD` (default: `E2ETestPassword123!`)
- `OLLAMA_BASE_URL` (optional)
- `OLLAMA_API_KEY` (optional)
