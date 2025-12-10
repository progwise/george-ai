FROM node:22-slim AS base

RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        g++ \
        sqlite3 \
        libsqlite3-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

FROM base AS builder

WORKDIR /app

# Copy package.json files for dependency installation (better layer caching)
COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/package-configs/package.json ./packages/package-configs/
COPY packages/web-utils/package.json ./packages/web-utils/
COPY apps/georgeai-webapp/package.json ./apps/georgeai-webapp/

RUN pnpm i --frozen-lockfile

# Copy source files afterwards to allow Docker layer caching
COPY packages/package-configs ./packages/package-configs
COPY packages/web-utils ./packages/web-utils
COPY apps/georgeai-webapp ./apps/georgeai-webapp
COPY CHANGELOG.md LICENSE ./

# Replace symlinks with actual files in public directory (required for Docker build)
RUN rm -f ./apps/georgeai-webapp/public/CHANGELOG.md && \
    cp ./CHANGELOG.md ./apps/georgeai-webapp/public/CHANGELOG.md && \
    cp ./LICENSE ./apps/georgeai-webapp/public/LICENSE

# Build the application
# ARG here to avoid cache invalidation of dependency layers when only commit SHA changes
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA="${GIT_COMMIT_SHA}"
# Clean any stale build artifacts to prevent cache-related asset hash mismatches
RUN rm -rf ./apps/georgeai-webapp/.output ./apps/georgeai-webapp/dist && \
    pnpm --filter @george-ai/webapp run build

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/webapp deploy --prod /app/deploy

FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-webapp

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --home /home/nodejs nodejs \
    && mkdir -p /home/nodejs/.cache \
    && chown -R nodejs:nodejs /home/nodejs

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder --chown=nodejs:nodejs /app/deploy .

# Copy the built output separately (not included in pnpm deploy)
COPY --from=builder --chown=nodejs:nodejs /app/apps/georgeai-webapp/.output ./.output

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=30s \
  CMD curl -f -s http://localhost:3000 > /dev/null || exit 1

CMD [ "node", "./.output/server/index.mjs" ]