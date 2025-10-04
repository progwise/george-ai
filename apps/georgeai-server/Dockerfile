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
COPY apps/georgeai-server/package.json ./apps/georgeai-server/
COPY apps/chat-web/package.json ./apps/chat-web/

RUN pnpm i --frozen-lockfile
RUN ls -la node_modules/ | head -10

# Copy source files
COPY packages ./packages
RUN du -sh packages/* | sort -h
COPY apps/georgeai-server ./apps/georgeai-server
RUN du -sh apps/georgeai-server/* | sort -h

# Generate Prisma client only (doesn't need DB connection)
RUN pnpm --filter @george-ai/pothos-graphql run prisma:generate:client

# Deploy creates a clean directory with resolved dependencies
RUN pnpm --filter @george-ai/server deploy --prod /app/deploy

FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-server
WORKDIR /app

# Copy the deployed output (all dependencies resolved, no symlinks)
COPY --from=builder /app/deploy .

RUN ls -la && du -sh * | sort -h

CMD [ "sh", "-c", "echo DATABASE_URL=$DATABASE_URL && cd /app/node_modules/@george-ai/pothos-graphql && pnpm prisma generate --sql && pnpm prisma migrate deploy && cd /app && pnpm start" ]