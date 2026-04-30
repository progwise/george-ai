# Developer Setup Guide

This guide covers setting up George AI for local development.

## Prerequisites

- Docker and Docker Compose
- Visual Studio Code with DevContainers extension
- Git

> **Notes:**
>
> - Mac with ARM: prefer docker desktop version not later than 4.57.0 because of slow disk performance
> - Backup your docker volumes before to prevent settings loss

## Getting Started

### 1. Open in DevContainer

Re-open the repository in a **DevContainer** using VS Code:

1. Open the repository in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: `Dev Containers: Reopen in Container`)
3. Wait for the container to build and start all services

**Notes**

- User inside the devcontainer is **node:node**
- **ssh** to youse terminals from your host is enabled and your ~/.ssh is mounted read only
- **/home/node/host** mounts to your hosts ~/ home for easy data access
- This team uses **claude code** inside the devcontainer. Use `curl -fsSL https://claude.ai/install.sh | bash` for standard installation.

### 2. Configure Environment Variables

Copy the example environment files to create your local configuration:

```bash
cp .env.example .env
```

- apps/georgeai-backend/.env
- apps/georgeai-webapp/.env
- services/event-queue-worker/.env

### 3. Running dev

- **Running**: Running `pnpm dev` will start:
  - `georgeai-backend` on port `3003`
  - `georgeai-webapp` on port `3001`

### After Configuration

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
Vite provides Hot Module Replacement (HMR) by establishing a WebSocket connection between the browser and the dev server. The Vite dev server automatically starts an HTTP server and creates a WebSocket server on the same host with a dynamically assigned port.

### 5. Set Up Keycloak

For complete Keycloak configuration instructions, see **[Keycloak Configuration Guide](./keycloak.md)**.

**Quick start:**

1. Open `http://localhost:8180` (admin/admin)
2. Import realm: `docs/examples/keycloak-george-ai-realm.json`
3. Update client redirect URIs to `http://localhost:3001/*`
4. Create a user account

For detailed steps including OAuth providers (Google, GitHub, LinkedIn) and avatar configuration, refer to the full [Keycloak guide](./keycloak.md)

> If keycloak compains about "https required" even if it is not configured for ssl you may need to change the master realm config. Connect to your keycloak docker container and execute kcadm.sh to change the config:

```bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin && /opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE
```

### 6. Database

**Migrations**

Navigate to the Prisma package and run migration from root.

```bash
pnpm run prisma:migrate
```

**Notes**

- Uses .env settings from ./packages/app-database/.env

**Restore**

If you need to restore some database it depends on the backup how to restore.

**pg_dumapall**

Can only be restored in an empty postgres docker like **gai-test-db**.

```bash
psql -h gai-test-db -U admin -f ~/backup.sql postgres
```

**Notes**

- **psql** is installed in the dev container

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
