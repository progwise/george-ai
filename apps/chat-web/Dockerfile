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

# Accept build args for environment variables needed at build time
ARG GAI_BACKEND_URL
ARG GAI_BACKEND_PUBLIC_URL
ARG GAI_KEYCLOAK_REDIRECT_URL
ARG GAI_KEYCLOAK_REALM
ARG GAI_KEYCLOAK_URL
ARG GAI_KEYCLOAK_CLIENT_ID
ARG GAI_PUBLIC_APP_URL
ARG GAI_GIT_COMMIT_SHA

# Set as environment variables for the build
ENV GAI_BACKEND_URL=$GAI_BACKEND_URL
ENV GAI_BACKEND_PUBLIC_URL=$GAI_BACKEND_PUBLIC_URL
ENV GAI_KEYCLOAK_REDIRECT_URL=$GAI_KEYCLOAK_REDIRECT_URL
ENV GAI_KEYCLOAK_REALM=$GAI_KEYCLOAK_REALM
ENV GAI_KEYCLOAK_URL=$GAI_KEYCLOAK_URL
ENV GAI_KEYCLOAK_CLIENT_ID=$GAI_KEYCLOAK_CLIENT_ID
ENV GAI_PUBLIC_APP_URL=$GAI_PUBLIC_APP_URL
ENV GAI_GIT_COMMIT_SHA=$GAI_GIT_COMMIT_SHA

COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web-utils/package.json ./packages/web-utils/
COPY apps/chat-web/package.json ./apps/chat-web/

RUN pnpm i --frozen-lockfile

# Copy source files
COPY packages/web-utils ./packages/web-utils
COPY apps/chat-web ./apps/chat-web

# Build the application
RUN pnpm --filter @george-ai/chat-web run build

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/chat-web deploy --prod /app/deploy

FROM base AS runner
LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/chat-web
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
     && adduser --system --uid 1001 vinxi

USER vinxi

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder --chown=vinxi:nodejs /app/deploy .
# Copy the built output
COPY --from=builder --chown=vinxi:nodejs /app/apps/chat-web/.output ./.output

CMD [ "node", "./.output/server/index.mjs" ]