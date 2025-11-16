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

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

You need `.env` files in the directory you start the app from:

- **Running from root** (recommended): `.env` in the **root** directory. Running `pnpm dev` will start:
  - `georgeai-backend` on port `3003`
  - `georgeai-webapp` on port `3001`

- **Running apps separately**: `.env` files in `apps/georgeai-backend` and `apps/georgeai-webapp`

- **Running Prisma scripts**: `.env` in `packages/pothos-graphql` (e.g., for `pnpm prisma generate`)

**Note:** The root `.env.example` is configured for development with devcontainer. For production deployments, see `docs/examples/.env.example` instead.

### 2a. AI Provider Configuration (Optional)

George AI supports multiple AI providers for embeddings, chat, and vision capabilities. **All providers are optional** - configure only what you need.

#### Ollama (Local Models)

For self-hosted, privacy-focused AI:

```bash
# .env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_API_KEY=  # Optional, leave empty if not using authentication
```

**Benefits**: Privacy, offline use, no API costs, full control
**Use cases**: Embeddings, chat, vision (with vision-capable models)

#### OpenAI (Cloud Models)

For cloud-based AI with the latest models:

1. **Get an OpenAI API key**: Visit https://platform.openai.com/api-keys
2. **Add to `.env`**:

```bash
OPENAI_API_KEY=sk-your-api-key-here
# OPENAI_BASE_URL=https://api.openai.com/v1  # Optional, for Azure or compatible endpoints
```

**Benefits**: Latest models, reliability, performance
**Use cases**: Embeddings, chat, vision, function calling

#### After Configuration

1. Start the application: `pnpm dev`
2. Navigate to **Admin → AI Models** in the UI (`http://localhost:3001/admin/ai-models`)
3. Click **"Sync Models"** to discover available models from all configured providers
4. Configure models in Library/Assistant/List settings

**For detailed instructions on managing models via the UI, see the [AI Models & Providers guide](https://george-ai.net/docs/admin/ai-models).**

#### Multi-Instance Ollama (Advanced)

For self-hosted deployments with multiple GPU servers, you can configure load balancing across Ollama instances:

```bash
# Primary instance
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_VRAM_GB=32

# Additional instances (up to 10)
OLLAMA_BASE_URL_1=http://ollama-gpu-1:11434
OLLAMA_VRAM_GB_1=24

OLLAMA_BASE_URL_2=http://ollama-gpu-2:11434
OLLAMA_VRAM_GB_2=24
```

George AI will automatically:

- Distribute load across instances based on GPU memory and current load
- Route requests to instances that have the required model loaded
- Failover to available instances if one goes offline

**For setup and monitoring instructions, see the [AI Models & Providers guide](https://george-ai.net/docs/admin/ai-models#multi-instance-ollama).**

### 4. Ports Overview

The following ports are used in the development environment:

| Service                    | Port  | Description                    |
| -------------------------- | ----- | ------------------------------ |
| Frontend (georgeai-webapp) | 3001  | React frontend with Vite HMR   |
| Backend (georgeai-backend) | 3003  | GraphQL API server             |
| PostgreSQL                 | 5432  | Main database                  |
| Keycloak                   | 8180  | Authentication service         |
| Keycloak DB                | 5433  | Keycloak's PostgreSQL database |
| Typesense                  | 8108  | Vector search engine           |
| Crawl4AI                   | 11235 | Web crawler service            |
| Ollama                     | 11434 | Local LLM service (optional)   |

**Vite HMR:**
Vite provides Hot Module Replacement (HMR) by establishing a WebSocket connection between the browser and the dev server. The Vite dev server automatically starts an HTTP server and creates a WebSocket server on the same host with a dynamically assigned port. We enhance this with a custom Vite plugin that extracts the HMR WebSocket port and writes it to `app.config.ts`, plus automatic port opening based on VS Code settings.

### 5. Set Up Keycloak

For complete Keycloak configuration instructions, see **[Keycloak Configuration Guide](./keycloak.md)**.

**Quick start:**

1. Open `http://localhost:8180` (admin/admin)
2. Import realm: `docs/examples/keycloak-george-ai-realm.json`
3. Update client redirect URIs to `http://localhost:3001/*`
4. Create a user account

For detailed steps including OAuth providers (Google, GitHub, LinkedIn) and avatar configuration, refer to the full [Keycloak guide](./keycloak.md)

### 6. Database Migration

Navigate to the Prisma package and run migrations:

```bash
cd packages/pothos-graphql
pnpm prisma migrate dev
```

### 7. Start Development Servers

You can run both apps from root:

```bash
pnpm dev
```

If you need to start **georgeai-webapp** and **georgeai-backend** separately you can also use:

1. Open two separate terminal windows
2. Navigate to `apps/georgeai-backend` in one and `apps/georgeai-webapp` in the other
3. Run `pnpm dev` in each terminal separately

This allows you to restart the backend independently when needed.

### 8. Access the Application

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
# Build only
docker compose -f docker-compose.verify.yml build

# Build and start both frontend and backend
docker compose -f docker-compose.verify.yml up --build

# Run in detached mode
docker compose -f docker-compose.verify.yml up --build -d

# Start only backend
docker compose -f docker-compose.verify.yml up --build gai-verify-backend

# Start only frontend
docker compose -f docker-compose.verify.yml up --build gai-verify-webapp
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
docker build -f apps/georgeai-webapp/Dockerfile -t george-ai-frontend:local .

# Build backend image
docker build -f apps/georgeai-backend/Dockerfile -t george-ai-backend:local .
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
3. **Permission errors**: Frontend runs as user `nodejs` (uid 1001), ensure mounted volumes have appropriate permissions
4. **Out of memory during build**: Increase Docker's memory allocation in Docker Desktop settings

**Debug Commands:**

```bash
# Check container logs
docker logs gai-verify-webapp
docker logs gai-verify-backend

# Access container shell
docker exec -it gai-verify-webapp sh
docker exec -it gai-verify-backend sh

# Check environment variables
docker exec gai-verify-webapp printenv | grep -E "(BACKEND_URL|KEYCLOAK|DATABASE)"
```

## Next Steps

- See [Architecture Documentation](./architecture.md) to understand the system design
- Read the [User Documentation](https://george-ai.net/docs) to learn about features
- Join our [Discord community](https://discord.gg/GbQFKb2MNJ) for help and discussions
