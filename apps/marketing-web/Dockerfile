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
COPY apps/marketing-web/package.json ./apps/marketing-web/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter marketing-web...

# Copy source files
COPY apps/marketing-web ./apps/marketing-web

# Copy LICENSE file for legal compliance
COPY LICENSE ./

# Build the static site
RUN pnpm --filter marketing-web build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Create non-root user for running nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -u 1001 -S nginx-user -G nginx-user

# Copy LICENSE file for legal compliance
COPY LICENSE /usr/share/nginx/html/

# Copy built static files from builder stage
COPY --from=builder /app/apps/marketing-web/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY apps/marketing-web/nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership of nginx files to non-root user
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
