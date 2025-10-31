# Docker Guide

Guide for building and running George AI Docker images for the apps in this monorepo:

- **georgeai-webapp** - the main app frontend
- **georgeai-backend** - the backend for graphql, upload and more
- **georgeai-web** - the george-ai.net marketing web
- **webcrawler** - the Crawl4AI service for web crawling
- **smb-test-server** - used to allow testing Windows File Shares

## Building Docker Images

Be aware of the difference between `pnpm build` and `docker build`:

- **`pnpm build`** - Compiles TypeScript and bundles code in your local environment using local dependencies, outputs to `dist/` folders
- **`docker build`** - Creates a self-contained Docker image with OS, Node.js, dependencies, and compiled application, ready to run anywhere

### Monorepo Build Context

**All Dockerfiles must be built from the repository root** due to monorepo dependencies on shared packages:

```bash
cd /workspaces/george-ai

# Build frontend
docker build -f apps/georgeai-webapp/Dockerfile -t georgeai-webapp .

# Build backend
docker build -f apps/georgeai-backend/Dockerfile -t georgeai-backend .

# Build marketing site
docker build -f apps/georgeai-web/Dockerfile -t georgeai-web .
```

Building from app directories will fail with "package not found" errors because Docker needs access to `packages/` and the root `pnpm-workspace.yaml`.

### Production Builds with Git SHA

```bash
GIT_COMMIT_SHA=$(git rev-parse HEAD)
docker build -f apps/georgeai-webapp/Dockerfile -t george-ai-frontend:latest --build-arg GIT_COMMIT_SHA=$GIT_COMMIT_SHA .
```

---

## Docker Compose Options

### 1. Production (Reference: `docs/examples/docker-compose.yml`)

**Purpose:** Self-hosting in production

**Includes:** All services (PostgreSQL, Keycloak, Typesense, Backend, Frontend, Ollama)

**Images:** Pre-built from GitHub Container Registry

```bash
# Copy example and customize for your deployment
cp docs/examples/docker-compose.yml docker-compose.yml
docker compose up -d
```

**Use when:** Deploying to production. See [Self-Hosting Guide](./self-hosting.md).

### 2. Local Verification (`docker-compose.verify.yml`)

**Purpose:** Test local Docker builds before CI/CD

**Includes:** Builds apps from source, connects to devcontainer services

**Ports:** 3002 (frontend), 3004 (backend), 3005 (marketing website)

```bash
docker compose -f docker-compose.verify.yml up --build
```

**Requirements:**

- Devcontainer services must be running (database, Keycloak, Typesense)
- Connects to `george-ai_devcontainer_default` network
- Access at http://localhost:3002 (webapp), http://localhost:3004/graphql (backend), http://localhost:3005 (marketing)

**Using .env file:**

To use values from your `.env` file (e.g., SMTP credentials for contact form):

```bash
source .env && docker compose -f docker-compose.verify.yml up --build
```

**Use when:** Testing Dockerfile changes locally.

### 3. Development (`.devcontainer/docker-compose.yml`)

**Purpose:** Development environment with hot reload

**Managed by:** VS Code DevContainer

**Use when:** Daily development with `pnpm dev`. See [Developer Setup Guide](./developer-setup.md).

---

## Why Not Docker from DevContainer?

**Do not run Docker commands inside the devcontainer.** Docker-in-Docker causes:

- **Network conflicts**: Nested networks create routing ambiguity
- **Volume issues**: Complex file permission and path mapping problems
- **Resource overhead**: Running Docker inside Docker wastes resources

**References:**

- [Do not use Docker-in-Docker for CI](https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/)
- [VS Code DevContainers and DinD issues](https://github.com/microsoft/vscode-remote-release/issues/1814)

**Correct workflow:**

```bash
# Development (inside devcontainer)
pnpm dev

# Docker testing (exit devcontainer first)
# Ctrl+Shift+P -> "Reopen Folder Locally"
docker compose -f docker-compose.verify.yml up --build

# Production (on server, not devcontainer)
docker compose up -d
```

---

## Troubleshooting

**Build fails "package not found"**: Build from root, not app directory

**Container can't connect to services**: Check environment variables and Docker network configuration

**Out of memory**: Increase Docker memory in Docker Desktop settings (8GB+ recommended)

**Port conflicts**: Use `docker-compose.verify.yml` (ports 3002, 3004)

**Permission errors**: Frontend runs as user `vinxi` (uid 1001), ensure mounted volumes have correct permissions

---

## Docker Swarm Deployment

For production deployments with orchestration, Docker Swarm provides:

- High availability with replicas
- Rolling updates with zero downtime
- Resource limits and health checks
- Automatic SSL with Caddy labels

**Learn more**: [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)

**Key differences from standard docker-compose.yml:**

- Uses `deploy:` sections for replicas and resources
- Managed with `docker stack deploy` instead of `docker compose up`
- Supports multi-node clusters

---

## Additional Resources

- [Developer Setup](./developer-setup.md) - Development environment
- [Self-Hosting Guide](./self-hosting.md) - Production deployment
- [CI/CD Workflow](../.github/workflows/build-publish-dockers.yml) - Automated builds
