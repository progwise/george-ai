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
COPY packages/api-crawler/package.json ./packages/api-crawler/
COPY packages/app-domain/package.json ./packages/app-domain/
COPY packages/connector-types/package.json ./packages/connector-types/
COPY packages/event-service-client/package.json ./packages/event-service-client/
COPY packages/file-converter/package.json ./packages/file-converter/
COPY packages/file-management/package.json ./packages/file-management/
COPY packages/html-crawler/package.json ./packages/html-crawler/
COPY packages/langchain-chat/package.json ./packages/langchain-chat/
COPY packages/mailer/package.json ./packages/mailer/
COPY packages/package-configs/package.json ./packages/package-configs/
COPY packages/pothos-graphql/package.json ./packages/pothos-graphql/
COPY packages/smb-crawler/package.json ./packages/smb-crawler/
COPY packages/web-utils/package.json ./packages/web-utils/
COPY apps/georgeai-backend/package.json ./apps/georgeai-backend/

RUN pnpm i --frozen-lockfile

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy only the source files for packages that backend depends on
COPY packages/ai-act ./packages/ai-act
COPY packages/ai-service-client ./packages/ai-service-client
COPY packages/api-crawler ./packages/api-crawler
COPY packages/app-domain ./packages/app-domain
COPY packages/connector-types ./packages/connector-types
COPY packages/event-service-client ./packages/event-service-client
COPY packages/file-converter ./packages/file-converter
COPY packages/file-management ./packages/file-management
COPY packages/html-crawler ./packages/html-crawler
COPY packages/langchain-chat ./packages/langchain-chat
COPY packages/mailer ./packages/mailer
COPY packages/package-configs ./packages/package-configs
COPY packages/pothos-graphql ./packages/pothos-graphql
COPY packages/smb-crawler ./packages/smb-crawler
COPY packages/web-utils ./packages/web-utils
COPY apps/georgeai-backend ./apps/georgeai-backend

# ARG here to avoid cache invalidation of dependency layers when only commit SHA changes
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA="${GIT_COMMIT_SHA}"

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/backend deploy --prod /app/deploy

FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/backend
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --home /home/server server \
    && mkdir -p /home/server/.cache \
    && chown -R server:nodejs /home/server

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder --chown=server:nodejs /app/deploy .

# Copy tsconfig.base.json for prisma generate --sql at runtime (used by app-domain)
# pnpm deploy doesn't include this config file, but prisma needs it for TypeScript compilation
COPY --from=builder --chown=server:nodejs /app/packages/package-configs/tsconfig.base.json ./node_modules/@george-ai/package-configs/

# Copy Prisma directory to predictable location for runtime migrations
# pnpm deploy stores packages in .pnpm with complex naming, so we copy to /app/prisma
COPY --from=builder --chown=server:nodejs /app/packages/app-domain/prisma /app/prisma

# Copy Prisma config file for Prisma v7 (needed to find datasource URL)
COPY --from=builder --chown=server:nodejs /app/packages/app-domain/prisma.config.ts /app/prisma.config.ts

# Create crawler credentials directory with proper permissions
RUN mkdir -p /app/.crawler-credentials && chown -R server:nodejs /app/.crawler-credentials

USER server

HEALTHCHECK --interval=10s --timeout=10s --retries=10 --start-period=90s \
  CMD curl -f -s http://localhost:3003/graphql > /dev/null || exit 1

CMD [ "sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=/app/prisma/schema.prisma && pnpm start" ]