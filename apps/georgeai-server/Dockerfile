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
COPY . .

RUN pnpm i --frozen-lockfile \
    && pnpm --filter @george-ai/server run build


FROM base AS runner

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-server
WORKDIR /app

COPY --from=builder /app/apps/georgeai-server/dist .
COPY --from=builder /app/packages/pothos-graphql/node_modules/@george-ai/prismaClient/libquery_engine* ./node_modules/@george-ai/prismaClient/

CMD [ "node","./server.cjs" ]