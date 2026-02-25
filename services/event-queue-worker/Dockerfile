FROM node:22-slim AS base

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
        curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate


FROM base AS builder

WORKDIR /app

COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/event-queue-worker/package.json ./services/event-queue-worker/
COPY packages/api-crawler/package.json ./packages/api-crawler/
COPY packages/app-commons/package.json ./packages/app-commons/
COPY packages/app-database/package.json ./packages/app-database/
COPY packages/app-domain/package.json ./packages/app-domain/
COPY packages/event-service-client/package.json ./packages/event-service-client/
COPY packages/file-management/package.json ./packages/file-management/
COPY packages/file-converter/package.json ./packages/file-converter/
COPY packages/html-crawler-client/package.json ./packages/html-crawler-client/
COPY packages/mailer/package.json ./packages/mailer/
COPY packages/smb-crawler-client/package.json ./packages/smb-crawler-client/
COPY packages/vector-store/package.json ./packages/vector-store/
COPY packages/package-configs/package.json ./packages/package-configs/
COPY packages/test-utils/package.json ./packages/test-utils/

RUN pnpm i --frozen-lockfile

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy only the source files for packages that backend depends on
COPY services/event-queue-worker ./services/event-queue-worker
COPY packages/api-crawler ./packages/api-crawler
COPY packages/app-commons ./packages/app-commons
COPY packages/app-database ./packages/app-database
COPY packages/app-domain ./packages/app-domain
COPY packages/event-service-client ./packages/event-service-client
COPY packages/file-management ./packages/file-management
COPY packages/file-converter ./packages/file-converter
COPY packages/html-crawler-client ./packages/html-crawler-client
COPY packages/mailer ./packages/mailer
COPY packages/smb-crawler-client ./packages/smb-crawler-client
COPY packages/vector-store ./packages/vector-store
COPY packages/package-configs ./packages/package-configs
COPY packages/test-utils ./packages/test-utils

# ARG here to avoid cache invalidation of dependency layers when only commit SHA changes
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA="${GIT_COMMIT_SHA}"


# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/event-queue-worker deploy --prod /app/deploy

FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/services/event-queue-worker
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --home /home/server server \
    && mkdir -p /home/server/.cache \
    && chown -R server:nodejs /home/server

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder --chown=server:nodejs /app/deploy .

USER server

CMD ["sh", "-c", "pnpm start"]