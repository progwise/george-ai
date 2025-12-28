# SMB Crawler Service Dockerfile
# Uses native SMB2 protocol (no mounts required)

FROM node:22-slim AS base

# Install curl for health checks
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy workspace configuration
COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package configs (needed for TypeScript)
COPY packages/package-configs/package.json ./packages/package-configs/

# Copy smb-crawler package (dependency)
COPY packages/smb-crawler/package.json ./packages/smb-crawler/

# Copy smb2-client package (dependency)
COPY packages/smb2-client/package.json ./packages/smb2-client/

# Copy smb-crawler-service app
COPY services/smb-crawler-service/package.json ./services/smb-crawler-service/

# Install dependencies
RUN pnpm i --frozen-lockfile

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy source files
COPY packages/smb-crawler ./packages/smb-crawler
COPY packages/smb2-client ./packages/smb2-client
COPY services/smb-crawler-service ./services/smb-crawler-service

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/smb-crawler-service deploy --prod /app/deploy

# Runner stage
FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/smb-crawler-service
WORKDIR /app

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder /app/deploy .

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f -s http://localhost:3006/health > /dev/null || exit 1

EXPOSE 3006

CMD [ "pnpm", "start" ]
