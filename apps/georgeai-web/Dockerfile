# Stage 1: Build the Astro site
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g corepack@0.31.0 && \
    corepack enable && \
    corepack prepare pnpm@9.15.4 --activate

# Copy package.json files for dependency installation (better layer caching)
COPY turbo.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/georgeai-web/package.json ./apps/georgeai-web/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @george-ai/web

# Copy source files
COPY apps/georgeai-web ./apps/georgeai-web

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Accept build args and expose as environment variables for Astro build
ARG PUBLIC_DISCORD_INVITE_URL=https://discord.gg/GbQFKb2MNJ
ENV PUBLIC_DISCORD_INVITE_URL=${PUBLIC_DISCORD_INVITE_URL}

# Build with Node adapter
RUN pnpm --filter @george-ai/web build

# Stage 2: Run with Node.js
FROM node:22-slim

LABEL org.opencontainers.image.source=https://github.com/progwise/george-ai/apps/georgeai-web

WORKDIR /app

# Create non-root user
RUN groupadd -g 1001 -r nodejs && \
    useradd -u 1001 -r -g nodejs nodejs

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Copy node_modules from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/georgeai-web/node_modules ./apps/georgeai-web/node_modules

# Copy built files and server entry from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/apps/georgeai-web/dist ./apps/georgeai-web/dist

# Switch to non-root user
USER nodejs

# Expose port 4321 (Astro default)
EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4321/', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321

# Start the Node server
CMD ["node", "./apps/georgeai-web/dist/server/entry.mjs"]
