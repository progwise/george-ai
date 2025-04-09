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
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate


FROM base AS builder

WORKDIR /app
COPY . .

RUN pnpm i --filter @george-ai/georgeai-server --frozen-lockfile \
    && pnpm --filter @george-ai/georgeai-server run build


FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-server
WORKDIR /app

COPY --from=builder /app/apps/georgeai-server/dist .
COPY --from=builder /app/packages/pothos-graphql/node_modules/@george-ai/prismaClient/libquery_engine* ./node_modules/@george-ai/prismaClient/

CMD [ "node","./server.cjs" ]