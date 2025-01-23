FROM node:20-slim AS base

RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        g++ \
        sqlite3 \
        libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_VERSION=9.15.0

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION}


FROM base AS builder

WORKDIR /app
COPY . .

RUN pnpm i --frozen-lockfile \
    && cd apps/georgeai-server \
    && pnpm run build


FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-server
WORKDIR /app

COPY --from=builder /app/apps/georgeai-server/dist .
COPY --from=builder /app/packages/pothos-graphql/node_modules/@george-ai/prismaClient/libquery_engine* ./node_modules/@george-ai/prismaClient/

CMD [ "node","./server.cjs" ]