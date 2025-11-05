FROM node:22-slim AS base

# for displaying the latest commit hash in the UI
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA="${GIT_COMMIT_SHA}"

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
COPY packages/web-utils/package.json ./packages/web-utils/
COPY apps/georgeai-webapp/package.json ./apps/georgeai-webapp/

# Configure git to use HTTPS instead of SSH for dependency installation
RUN git config --global url."https://github.com/".insteadOf git@github.com:

RUN pnpm i --frozen-lockfile

# Copy source files afterwards to allow Docker layer caching
COPY packages/web-utils ./packages/web-utils
COPY apps/georgeai-webapp ./apps/georgeai-webapp
COPY CHANGELOG.md LICENSE ./

# Build the application
RUN pnpm --filter @george-ai/webapp run build

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