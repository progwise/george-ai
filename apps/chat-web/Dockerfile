FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Update Corepack to the version with the fix and enable PNPM

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
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

FROM base AS builder

WORKDIR /app
COPY . .

RUN pnpm i --frozen-lockfile \
    && pnpm run build
  

FROM base AS runner
LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/chat-web
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
     && adduser --system --uid 1001 vinxi

USER vinxi

COPY --from=builder --chown=vinxi:nodejs /app/apps/chat-web/.output .

CMD [ "node", "/app/server/index.mjs" ]