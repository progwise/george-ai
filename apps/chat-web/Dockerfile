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

RUN pnpm i --frozen-lockfile
RUN --mount=type=secret,id=OPENAI_API_KEY \
    --mount=type=secret,id=TAVILY_API_KEY \
    pnpm run build
RUN ls -al ./apps/chat-web


FROM base AS runner
LABEL org.opencontainers.image.source https://github.com/progwise/george-ai/apps/chat-web
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vinxi
USER vinxi

RUN --mount=type=secret,id=OPENAI_API_KEY,uid=1001 \
    --mount=type=secret,id=TAVILY_API_KEY,uid=1001 \
    echo "OPENAI_API_KEY=$(cat /run/secrets/OPENAI_API_KEY)" > .env \
    echo "TAVILY_API_KEY=$(cat /run/secrets/TAVILY_API_KEY)" >> .env \
    source ./.env 

COPY --from=builder --chown=vinxi:nodejs /app/apps/chat-web/.output .
CMD ["node", "/app/server/index.mjs"]