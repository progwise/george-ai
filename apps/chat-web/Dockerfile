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
SHELL ["/bin/bash", "-c"]
WORKDIR /app
COPY . .

RUN --mount=type=secret,id=OPENAI_API_KEY \
    --mount=type=secret,id=TAVILY_API_KEY \
    echo "OPENAI_API_KEY=$(cat /run/secrets/OPENAI_API_KEY)\n" > ./.env.docker \
    && echo "TAVILY_API_KEY=$(cat /run/secrets/TAVILY_API_KEY)\n" >> ./.env.docker \
    && source ./.env.docker \
    && cat ./.env.docker

RUN  pnpm i --frozen-lockfile \
    && pnpm run build \
    && ls -al .


FROM base AS runner
SHELL ["/bin/bash", "-c"] 
LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/chat-web
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
     && adduser --system --uid 1001 vinxi
     
USER vinxi

COPY --from=builder --chown=vinxi:nodejs /app/apps/chat-web/.output .
COPY --from=builder --chown=vinxi:nodejs /app/.env.docker .
RUN source ./.env.docker
CMD ["node", "/app/server/index.mjs"]