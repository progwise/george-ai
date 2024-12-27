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

RUN --mount=type=secret,id=OPENAI_API_KEY \
    --mount=type=secret,id=TAVILY_API_KEY \
    --mount=type=secret,id=POCKETBASE_TOKEN \
    export OPENAI_API_KEY=$(cat /run/secrets/OPENAI_API_KEY) \
    && export TAVILY_API_KEY=$(cat /run/secrets/TAVILY_API_KEY) \
    && export POCKETBASE_TOKEN=$(cat /run/secrets/POKETBASE_TOKEN) \
    && pnpm i --frozen-lockfile \
    && pnpm run build \
    && echo "#!/usr/bin/env bash\n" > ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && echo "export OPENAI_API_KEY=$OPENAI_API_KEY" >>./entrypoint.sh \
    && echo "export TAVILY_API_KEY=$TAVILY_API_KEY" >> ./entrypoint.sh \
    && echo "export POCKETBASE_TOKEN=$POCKETBASE_TOKEN" >> ./entrypoint.sh \
    && echo "\$@\n" >> ./entrypoint.sh
  

FROM base AS runner
LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/chat-web
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
     && adduser --system --uid 1001 vinxi

USER vinxi

COPY --from=builder --chown=vinxi:nodejs /app/apps/chat-web/.output .
COPY --from=builder --chown=vinxi:nodejs /app/entrypoint.sh .

ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD [ "node", "/app/server/index.mjs" ]