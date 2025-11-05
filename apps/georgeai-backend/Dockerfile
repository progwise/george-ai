FROM node:22-slim AS base

# for displaying the latest commit hash in the UI
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA="${GIT_COMMIT_SHA}"

RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        libcairo2-dev \
        libjpeg62-turbo-dev \
        libpango1.0-dev \
        libgif-dev \
        build-essential \
        g++ \
        sqlite3 \
        libsqlite3-dev \
        cifs-utils \
        smbclient \
        curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate


FROM base AS builder

WORKDIR /app

COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ai-act/package.json ./packages/ai-act/
COPY packages/ai-service-client/package.json ./packages/ai-service-client/
COPY packages/file-converter/package.json ./packages/file-converter/
COPY packages/file-management/package.json ./packages/file-management/
COPY packages/langchain-chat/package.json ./packages/langchain-chat/
COPY packages/package-configs/package.json ./packages/package-configs/
COPY packages/pothos-graphql/package.json ./packages/pothos-graphql/
COPY packages/web-utils/package.json ./packages/web-utils/
COPY apps/georgeai-backend/package.json ./apps/georgeai-backend/

# Configure git to use HTTPS instead of SSH for dependency installation
RUN git config --global url."https://github.com/".insteadOf git@github.com:

RUN pnpm i --frozen-lockfile

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy only the source files for packages that backend depends on
COPY packages/ai-act ./packages/ai-act
COPY packages/ai-service-client ./packages/ai-service-client
COPY packages/file-converter ./packages/file-converter
COPY packages/file-management ./packages/file-management
COPY packages/langchain-chat ./packages/langchain-chat
COPY packages/package-configs ./packages/package-configs
COPY packages/pothos-graphql ./packages/pothos-graphql
COPY packages/web-utils ./packages/web-utils
COPY apps/georgeai-backend ./apps/georgeai-backend

# Generate Prisma client only (doesn't need DB connection)
RUN pnpm --filter @george-ai/pothos-graphql run prisma:generate:client

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/backend deploy --prod /app/deploy

FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/backend
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --home /home/server server \
    && mkdir -p /home/server/.cache \
    && chown -R server:nodejs /home/server

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder --chown=server:nodejs /app/deploy .

USER server

HEALTHCHECK --interval=10s --timeout=10s --retries=10 --start-period=90s \
  CMD curl -f -s http://localhost:3003/graphql > /dev/null || exit 1

CMD [ "sh", "-c", "cd /app/node_modules/@george-ai/pothos-graphql && pnpm prisma migrate deploy && pnpm prisma generate --sql && cd /app && pnpm start" ]