FROM node:20-slim AS base

# ARG TYPESENSE_API_HOST
# ARG TYPESENSE_API_PORT
# ARG TYPESENSE_API_PROTOCOL
# ARG TYPESENSE_API_KEY
# ARG POCKETBASE_URL
# ARG POCKETBASE_TOKEN
# ARG OPENAI_API_KEY
# ARG TAVILY_API_KEY'

RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        g++ \
        sqlite3 \
        libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV YARN_VERSION=3.6.1

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}


FROM base AS builder

WORKDIR /app
COPY . .

RUN yarn --immutable
RUN --mount=type=secret,id=OPENAI_API_KEY,env=OPENAI_API_KEY \
    --mount=type=secret,id=TAVILY_API_KEY,env=TAVILY_API_KEY \
    yarn build

FROM base AS runner

WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vinxi
USER vinxi
 
COPY --from=builder /app/apps/chat-web/.output .
CMD node /apps/server/index.mjs