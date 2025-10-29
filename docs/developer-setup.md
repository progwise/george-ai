# Developer Setup Guide

This guide covers setting up George AI for local development.

## Prerequisites

- Docker and Docker Compose
- Visual Studio Code with DevContainers extension
- Git

**Note:** DevContainers may have issues on Windows machines.

## Getting Started

### 1. Open in DevContainer

Re-open the repository in a **DevContainer** using VS Code:

1. Open the repository in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: `Dev Containers: Reopen in Container`)
3. Wait for the container to build and start all services

### 2. Configure Environment Variables

You need `.env` files in the directory you start the app from:

- **Running from root**: Setup `.env` in the **root** directory. Running `pnpm dev` will start:
  - `georgeai-server` on port `3003`
  - `chat-web` on port `3001`

- **Running apps separately**: Setup `.env` files in `apps/georgeai-server` and `apps/chat-web`

- **Running Prisma scripts**: Setup `.env` in `packages/pothos-graphql` (e.g., for `pnpm prisma generate`)

Use the `env.example` files in each directory as references.

### 3. Ports Overview

The following ports are used in the development environment:

| Service                   | Port  | Description                    |
| ------------------------- | ----- | ------------------------------ |
| Frontend (chat-web)       | 3001  | React frontend with Vite HMR   |
| Backend (georgeai-server) | 3003  | GraphQL API server             |
| PostgreSQL                | 5432  | Main database                  |
| Keycloak                  | 8180  | Authentication service         |
| Keycloak DB               | 5433  | Keycloak's PostgreSQL database |
| Typesense                 | 8108  | Vector search engine           |
| Crawl4AI                  | 11235 | Web crawler service            |
| Ollama                    | 11434 | Local LLM service (optional)   |

**Vite HMR:**
Vite provides Hot Module Replacement (HMR) by establishing a WebSocket connection between the browser and the dev server. The Vite dev server automatically starts an HTTP server and creates a WebSocket server on the same host with a dynamically assigned port. We enhance this with a custom Vite plugin that extracts the HMR WebSocket port and writes it to `app.config.ts`, plus automatic port opening based on VS Code settings.

### 4. Set Up Keycloak

Keycloak handles authentication for George AI. Follow these steps to configure it:

#### 4.1. Access Keycloak Admin Console

1. Open `http://localhost:8180` in your browser
2. Log in with default credentials:
   - **Username:** `admin`
   - **Password:** `admin`

#### 4.2. Create Realm

Create a new Realm using the value of `KEYCLOAK_REALM` from your `.env` file.

#### 4.3. Create Client

1. In the left sidebar, click **Clients** → **Create Client**
2. Use the value of `KEYCLOAK_CLIENT_ID` from your `.env` file as the **Client ID**
3. Add the following URLs:
   - **Valid Redirect URIs:**
     - `http://localhost:3001`
     - `http://localhost:3001/*`
   - **Valid Post Logout Redirect URIs:**
     - `http://localhost:3001`
     - `http://localhost:3001/*`
   - **Web Origins:**
     - `http://localhost:3001`
     - `http://localhost:3001/*`

#### 4.4. Create User

1. Navigate to **Users** → **Add User**
2. Fill in required fields and click **Create**
3. After creation:
   - **Credentials tab**: Set a password with **Temporary** set to **Off**
   - **Details tab**: Provide:
     - First Name
     - Last Name
     - Email
     - Enable **Email Verified** toggle

#### 4.5. Configure Identity Provider (Optional)

1. Go to **Identity Providers** in the left sidebar
2. Choose a provider (Google, GitHub, or OpenID Connect)
3. Configure with required credentials (Client ID and Client Secret)

**OAuth App Setup Documentation:**

- [Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [LinkedIn OAuth](https://techdocs.akamai.com/identity-cloud/docs/the-linkedin-oauth-20-social-login-configuration-guide)

### 5. Database Migration

Navigate to the Prisma package and run migrations:

```bash
cd packages/pothos-graphql
pnpm prisma migrate dev
```

### 6. Start Development Servers

You can run both apps from root:

```bash
pnpm dev
```

**Known Issue:** `georgeai-server` is not stable and may break on file changes in Vite dev mode. As a temporary workaround:

1. Open two separate terminal windows
2. Navigate to `apps/georgeai-server` in one and `apps/chat-web` in the other
3. Run `pnpm dev` in each terminal separately

This allows you to restart the backend independently when needed.

### 7. Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3001
- **Backend GraphQL Playground**: http://localhost:3003/graphql
- **Keycloak Admin**: http://localhost:8180

## Docker Build & Testing

### Verifying Docker Builds

The project includes `docker-compose.verify.yml` to verify Docker builds work correctly.

#### Prerequisites

- Devcontainer must be running (with all services: databases, Keycloak, Typesense)
- Ports 3002 and 3004 must be available

#### Build and Run

```bash
# Build and start both frontend and backend
docker compose -f docker-compose.verify.yml up --build

# Run in detached mode
docker compose -f docker-compose.verify.yml up --build -d

# Start only backend
docker compose -f docker-compose.verify.yml up --build gai-verify-backend

# Start only frontend
docker compose -f docker-compose.verify.yml up --build gai-verify-frontend
```

#### Access Verify Services

- **Verify Frontend**: http://localhost:3002
- **Verify Backend GraphQL**: http://localhost:3004/graphql
- **Keycloak**: http://localhost:8180 (shared with devcontainer)

#### Network Configuration

The verify containers connect to the devcontainer Docker network (`george-ai_devcontainer_default`) and communicate with services using container names:

- Database: `gai-chatweb-db`
- Typesense: `gai-typesense`
- Keycloak: `gai-keycloak`

Port mappings avoid conflicts:

- Verify frontend: 3002 (instead of 3001)
- Verify backend: 3004 (instead of 3003)

#### Managing Verify Containers

```bash
# Stop services
docker compose -f docker-compose.verify.yml down

# Stop and remove volumes
docker compose -f docker-compose.verify.yml down -v

# Remove images as well
docker compose -f docker-compose.verify.yml down --rmi all -v

# View logs
docker compose -f docker-compose.verify.yml logs -f
```

### Building Individual Images

Both images must be built from the **root directory** to include all monorepo dependencies:

```bash
# Build frontend image
docker build -f apps/chat-web/Dockerfile -t george-ai-frontend:local .

# Build backend image
docker build -f apps/georgeai-server/Dockerfile -t george-ai-backend:local .
```

### Runtime Configuration

Docker images support **runtime configuration** for multi-tenant deployments:

1. **Build Time**: Images are built without environment-specific values
2. **Runtime**: Configuration provided via environment variables
3. **Server Function**: Frontend uses server functions to fetch configuration at runtime

**Key Environment Variables:**

- `BACKEND_URL` - Internal backend URL for server-side requests
- `BACKEND_PUBLIC_URL` - Public backend URL for client-side requests
- `KEYCLOAK_URL` - Keycloak server URL (must be external/public)
- `KEYCLOAK_REALM` - Keycloak realm name
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID
- `KEYCLOAK_REDIRECT_URL` - Frontend redirect URL
- `PUBLIC_APP_URL` - Public frontend URL
- `GIT_COMMIT_SHA` - Git commit hash for version tracking

**Benefits:**

- ✅ Single Docker image for all customer environments
- ✅ Different URLs/configuration per deployment
- ✅ No rebuild needed for configuration changes
- ✅ Simplified CI/CD pipeline

### CI/CD Integration

The GitHub workflow at `.github/workflows/build-publish-dockers.yml` automatically builds and publishes Docker images to GitHub Container Registry (ghcr.io) on pushes to main.

Images are built once and can be deployed to multiple environments by providing different environment variables at deployment time.

### Troubleshooting

**Common Issues:**

1. **Build fails with "package not found"**: Build from root directory, not from apps folders
2. **Container can't connect to services**: Check that services are accessible and `.env` variables are correct
3. **Permission errors**: Frontend runs as user `vinxi` (uid 1001), ensure mounted volumes have appropriate permissions
4. **Out of memory during build**: Increase Docker's memory allocation in Docker Desktop settings

**Debug Commands:**

```bash
# Check container logs
docker logs gai-verify-frontend
docker logs gai-verify-backend

# Access container shell
docker exec -it gai-verify-frontend sh
docker exec -it gai-verify-backend sh

# Check environment variables
docker exec gai-verify-frontend printenv | grep -E "(BACKEND_URL|KEYCLOAK|DATABASE)"
```

## Next Steps

- See [Architecture Documentation](./architecture.md) to understand the system design
- Read the [User Documentation](https://george-ai.net/docs) to learn about features
- Join our [Discord community](https://discord.gg/5XP8f2Qe) for help and discussions
