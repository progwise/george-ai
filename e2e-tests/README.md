# George AI E2E Tests

End-to-end tests for George AI using Playwright.

## Quick Start

### Devcontainer Workflow (Recommended)

**Step 1: Start services in devcontainer**

The devcontainer automatically starts these services via Docker Compose:

- PostgreSQL database (`localhost:5434`)
- Keycloak auth service (`localhost:8180`)
- Typesense vector search (`localhost:8108`)
- n8n workflow automation (`localhost:5678`)
- pgAdmin database UI (`localhost:15080`)

Then, inside the devcontainer, start the development apps:

```bash
# From devcontainer root
pnpm dev
```

This starts:

- Backend (GraphQL API) on `localhost:3003`
- Webapp (React frontend) on `localhost:3001`
- Web (Astro marketing site) on `localhost:4321`

**Step 2: Run tests from host machine**

Open a terminal on your **host machine** (NOT in devcontainer) for the best Playwright UI experience:

```bash
# Navigate to e2e-tests folder (on host)
cd e2e-tests

# Install dependencies (one time)
pnpm install

# Install Playwright browsers (one time)
pnpm playwright install

# Configure test environment (one time)
cp .env.example .env
# Edit .env and set credentials (E2E_USERNAME, E2E_PASSWORD)
# Optionally set BASE_URL if webapp runs on different host/port

# Run tests with UI
pnpm test:ui

# Or run headless
pnpm test
```

The tests will connect to the services running in your devcontainer via `localhost:3001` and `localhost:3003` (or the URL specified in `BASE_URL`).

**Note:** If you encounter Keycloak errors with Firefox during local development, use Chromium or WebKit instead: `pnpm test:ui --project=chromium`. Firefox blocks third-party cookies on localhost ([issue #23018](https://github.com/keycloak/keycloak/issues/23018)). In CI there are no Firefox issues.

**Important - Custom BASE_URL:** If you set a custom `BASE_URL` in `.env` (different from `http://localhost:3001`), you **must** add the redirect URL to your Keycloak configuration:

1. Check which Keycloak instance your webapp uses (see `KEYCLOAK_URL` in `apps/georgeai-webapp/.env`)
   - Local: `http://localhost:8180` (george-ai realm)
   - Production: `https://keycloak.george-ai.net` (e2e realm)
2. Go to Keycloak Admin Console → Clients → george-ai (or e2e-test) → Settings
3. Add your BASE_URL to "Valid redirect URIs": `<BASE_URL>/*`
   - Example: `http://localhost:8080/*`
   - Example: `http://192.168.1.100:3001/*`
4. Save changes

Without this, authentication will fail with "Invalid redirect_uri" error.

### Running Against Local Docker Environment (Simulates CI/CD)

Use `docker-compose.local.yml` to spin up a completely isolated, fresh environment - perfect for simulating CI/CD locally without affecting your devcontainer setup.

**Step 1: Start the isolated environment**

```bash
cd e2e-tests
docker compose -f docker-compose.local.yml up --build
```

This starts fresh containers on different ports:

- Webapp: `localhost:3011`
- Backend: `localhost:3013`
- Database: `localhost:5442`
- Typesense: `localhost:8118`
- Marketing site: `localhost:4331`

**Step 2: Configure .env for isolated environment**

```bash
# .env
BASE_URL=http://localhost:3011
DATABASE_URL=postgresql://chatweb:password@localhost:5442/chatweb
E2E_USERNAME=e2e-test-user@example.com
E2E_EMAIL=e2e-test-user@example.com
E2E_PASSWORD=E2ETestPassword123!
```

**Step 3: Run tests**

```bash
pnpm install
pnpm playwright install
pnpm test
```

**Clean up:**

```bash
# Stop and remove containers + volumes (fresh start)
docker compose -f docker-compose.local.yml down -v
```

### Running Against Devcontainer Environment

If you prefer to test against your running devcontainer (where `pnpm dev` is running):

**Step 1: Ensure devcontainer is running with `pnpm dev`**

**Step 2: Configure .env for devcontainer**

```bash
# .env
DATABASE_URL=postgresql://chatweb:password@localhost:5434/chatweb
E2E_USERNAME=test
E2E_EMAIL=playwright@test.de
E2E_PASSWORD=Test123!
# BASE_URL defaults to http://localhost:3001
```

**Step 3: Run tests from host machine** (NOT from inside devcontainer)

```bash
cd e2e-tests
pnpm install
pnpm playwright install
pnpm test:ui
```

### Running Standalone (Without Devcontainer) - Legacy

If you're not using the devcontainer and have your own setup:

```bash
# 1. Configure credentials
cp .env.example .env
# Edit .env and set E2E_USERNAME and E2E_PASSWORD

# 2. Start all services with Docker Compose
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Install Playwright browsers
pnpm playwright install

# 5. Run tests
pnpm test:ui
```

## Common Tasks

### Run Specific Test

```bash
# Run single test file
pnpm test changelog.spec.ts

# Run tests matching pattern
pnpm test --grep "login"
```

### Debug Failing Tests

```bash
# Open Playwright UI to step through tests
pnpm test:ui

# Run with debug mode enabled
E2E_DEBUG=true pnpm test

# View test report after run
pnpm playwright show-report
```

### View Service Logs

**Webapp/Backend/Web logs:**

- Check the devcontainer terminal where you ran `pnpm dev`

**Database/Keycloak/Typesense logs:**

- Use Docker Desktop dashboard on your host machine - find the service and view logs in the UI
- Or via CLI: `docker logs gai-chatweb-db`, `docker logs gai-keycloak`, `docker logs gai-typesense`

### Clean State

```bash
# Reset all services (removes all data)
docker compose down -v
docker compose up -d
```

## Test Credentials

Test credentials are configured in `.env`. Copy `.env.example` to `.env` and set:

- `E2E_USERNAME`: Test user email
- `E2E_PASSWORD`: Test user password

See `.env.example` for defaults.

## Architecture

Tests run against these services:

- **Frontend** (`localhost:3001`): React webapp
- **Backend** (`localhost:3003`): GraphQL API
- **Database**: PostgreSQL (isolated per environment)
- **Search**: Typesense (isolated per environment)
- **Auth**: Shared Keycloak instance at `keycloak.george-ai.net`

## Writing Tests

See existing tests in `src/` for patterns:

- `login.spec.ts`: Authentication flows
- `changelog.spec.ts`: Content rendering and navigation

### Common Patterns

```typescript
// Login helper (reusable)
await page.goto('/')
await page.getByRole('button', { name: 'Sign in' }).click()
await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
await page.getByRole('button', { name: 'Sign in' }).click()

// Wait for navigation
await expect(page).toHaveURL(/\/expected-path/)

// Verify content rendering
const content = await page.locator('.selector').textContent()
expect(content).toContain('expected text')
```

## CI/CD

Tests run automatically in GitHub Actions on every pull request. See `.github/workflows/e2e-tests.yml` for CI configuration.
