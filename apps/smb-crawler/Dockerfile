# SMB Crawler Service Dockerfile
# This service runs as root to enable SMB mounting

FROM node:22-slim AS base

# Install cifs-utils for SMB mounting and curl for health checks
RUN apt-get update \
    && apt-get install -y \
        cifs-utils \
        smbclient \
        curl \
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

# Copy smb-crawler-service app
COPY apps/smb-crawler/package.json ./apps/smb-crawler/

# Install dependencies
RUN pnpm i --frozen-lockfile

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy source files
COPY packages/smb-crawler ./packages/smb-crawler
COPY apps/smb-crawler ./apps/smb-crawler

# Build the service
RUN pnpm --filter @george-ai/smb-crawler-service run build

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/smb-crawler-service deploy --prod /app/deploy

# Runner stage
FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/smb-crawler
WORKDIR /app

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder /app/deploy .

# Create directories for mounts and credentials
RUN mkdir -p /app/.smb-mounts /app/.smb-credentials && \
    chmod 700 /app/.smb-credentials

# Set environment variables for mount directories
ENV SMB_MOUNT_DIR=/app/.smb-mounts
ENV SMB_CREDENTIALS_DIR=/app/.smb-credentials

# Run as root (required for mounting filesystems)
USER root

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f -s http://localhost:3006/health > /dev/null || exit 1

EXPOSE 3006

CMD [ "pnpm", "start" ]
