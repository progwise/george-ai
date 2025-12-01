# Self-Hosting Guide

This guide covers deploying George AI in your own infrastructure.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Configuration Guide](#configuration-guide)
- [Deployment Scenarios](#deployment-scenarios)
- [Backup and Restore](#backup-and-restore)
- [Monitoring and Logging](#monitoring-and-logging)
- [Scaling and Performance](#scaling-and-performance)
- [Security Best Practices](#security-best-practices)
- [Upgrade Procedures](#upgrade-procedures)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Hardware Requirements

- **CPU**: 4 cores (8+ recommended for production)
- **RAM**: 8 GB (16+ GB recommended for production)
- **Storage**: 50 GB SSD (scales with data volume)
- **Network**: Stable internet connection for AI services

### Software Requirements

- **Docker**: 24.0+ with Docker Compose
- **Operating System**: Linux (Ubuntu 22.04+, Debian 12+, RHEL 9+)
- **Ports**: 80 (HTTP), 443 (HTTPS) - Caddy handles all routing internally

### Optional Components

- **GPU**: NVIDIA GPU with Docker runtime for Ollama acceleration
- **SMTP Server**: For email notifications and contact forms

---

## Quick Start with Docker Compose

> **Reference Implementation**: A complete docker-compose example is available at [`docs/examples/docker-compose.yml`](./examples/docker-compose.yml). This includes Caddy as reverse proxy for automatic HTTPS.

### 1. Copy the Example Files

```bash
# Create a directory for George AI
mkdir george-ai && cd george-ai

# Download the example files
curl -O https://raw.githubusercontent.com/progwise/george-ai/main/docs/examples/docker-compose.yml
curl -O https://raw.githubusercontent.com/progwise/george-ai/main/docs/examples/.env.example
curl -O https://raw.githubusercontent.com/progwise/george-ai/main/docs/examples/Caddyfile
curl -O https://raw.githubusercontent.com/progwise/george-ai/main/docs/examples/keycloak-george-ai-realm.json
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your hostname:

```bash
HOST_NAME=george-ai.local
DB_PASSWORD=your_secure_password_here
KEYCLOAK_ADMIN_PASSWORD=your_admin_password_here
TYPESENSE_API_KEY=your_typesense_api_key_here
```

### 3. Configure DNS Resolution

The setup uses subdomains for each service. You need to configure DNS so these resolve to your server:

- `george-ai.local` → Frontend
- `api.george-ai.local` → Backend API
- `auth.george-ai.local` → Keycloak
- `n8n.george-ai.local` → n8n (workflow automation)

#### Option A: Local Hosts File (Single Machine)

Add entries to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
192.168.1.100  george-ai.local
192.168.1.100  api.george-ai.local
192.168.1.100  auth.george-ai.local
192.168.1.100  n8n.george-ai.local
```

Replace `192.168.1.100` with your server's IP address.

#### Option B: Pi-hole (Recommended for Home Networks)

If you have Pi-hole as your network DNS:

1. Go to **Local DNS** → **DNS Records**
2. Add records for each subdomain:
   - `george-ai.local` → `192.168.1.100`
   - `api.george-ai.local` → `192.168.1.100`
   - `auth.george-ai.local` → `192.168.1.100`
   - `n8n.george-ai.local` → `192.168.1.100`

#### Option C: dnsmasq (Linux Server)

Add to `/etc/dnsmasq.conf`:

```
address=/george-ai.local/192.168.1.100
```

This creates a wildcard entry that resolves `*.george-ai.local` to your server.

#### Option D: Router DNS (Network-Wide)

Many routers support custom DNS entries. Check your router's admin interface for "DNS" or "Local DNS" settings.

### 4. Start All Services

```bash
docker compose up -d
```

This starts:

- **Caddy** - Reverse proxy with automatic HTTPS (self-signed certificates)
- **PostgreSQL** - Main database
- **Keycloak** - Authentication
- **Typesense** - Vector search
- **Backend** - GraphQL API
- **Frontend** - React web app
- **Webcrawler** - Web page crawling
- **n8n** - Workflow automation

### 5. Configure Keycloak

For complete Keycloak configuration instructions, see **[Keycloak Configuration Guide](./keycloak.md)**.

**Quick start:**

1. Access Keycloak at `https://auth.george-ai.local` (admin / your KEYCLOAK_ADMIN_PASSWORD)
2. Import realm: Upload `keycloak-george-ai-realm.json`
3. Update client redirect URIs to match your domain
4. Create a user account

For detailed production configuration including OAuth providers and security considerations, refer to the full [Keycloak guide](./keycloak.md).

### 6. Run Database Migrations

Initialize the database schema:

```bash
docker compose exec backend sh -c "cd /app/node_modules/@george-ai/pothos-graphql && npx prisma migrate deploy"
```

### 7. Access George AI

- **Frontend**: https://george-ai.local
- **Backend GraphQL API**: https://api.george-ai.local/graphql
- **Keycloak Admin**: https://auth.george-ai.local
- **n8n**: https://n8n.george-ai.local

> **Note**: Your browser will show a certificate warning because Caddy generates self-signed certificates for local domains. This is expected and safe for internal use. Click "Advanced" and proceed to accept the certificate.

---

## Configuration Guide

### Environment Variables Reference

#### Database Configuration

```bash
# Main Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DB_USER=george
DB_PASSWORD=your_password
DB_NAME=georgeai
DB_PORT=5432

# Keycloak Database
KEYCLOAK_DB_PASSWORD=keycloak_db_password
```

#### Keycloak Authentication

```bash
# Keycloak Admin
KEYCLOAK_ADMIN_PASSWORD=admin_password

# Keycloak Connection
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=george-ai
KEYCLOAK_CLIENT_ID=george-ai-client
KEYCLOAK_REDIRECT_URL=http://localhost:3001
```

#### Typesense Configuration

```bash
TYPESENSE_API_KEY=your_api_key
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
```

#### Application URLs

```bash
# Backend
BACKEND_URL=http://backend:3003          # Internal container communication
BACKEND_PUBLIC_URL=http://localhost:3003  # Public-facing backend URL
BACKEND_PORT=3003

# Frontend
PUBLIC_APP_URL=http://localhost:3001
FRONTEND_PORT=3001
```

#### File Storage

```bash
UPLOADS_PATH=/app/storage
FILE_STORAGE_PATH=/app/storage
```

#### AI Services (Optional)

> **Note**: AI providers are now configured **per workspace** via the Admin UI (`/admin/ai-services`). Environment variables below are optional and only used for initial provider import via "Restore Default Providers" button. See [Workspace Configuration](#workspace-configuration) for details.

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional, defaults to OpenAI

# Ollama (Local LLM)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_API_KEY=optional_api_key
OLLAMA_VRAM_GB=32

# Multiple Ollama instances (supports up to 10 instances)
OLLAMA_BASE_URL_1=http://host.docker.internal:11434
OLLAMA_API_KEY_1=
OLLAMA_VRAM_GB_1=64

OLLAMA_BASE_URL_2=https://ollama.example.com:11434
OLLAMA_API_KEY_2=your-api-key-here
OLLAMA_VRAM_GB_2=128
```

**Key Changes in Multi-Tenancy:**

- Each workspace can configure its own AI providers (Ollama, OpenAI)
- Provider configurations are stored in the database, not environment variables
- Multiple workspaces can share the same physical Ollama/OpenAI instances
- Model availability is automatically filtered based on workspace providers
- Environment variables above are only used for "Restore Default Providers" feature

#### Worker Configuration

```bash
# Auto-start background workers
AUTOSTART_ENRICHMENT_WORKER=false
AUTOSTART_CONTENT_PROCESSING_WORKER=false
```

#### Email Configuration (Optional)

```bash
SMTP_HOSTNAME=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

#### Google Drive Integration (Optional)

```bash
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
```

#### Miscellaneous

```bash
NODE_ENV=production
GIT_COMMIT_SHA=v1.0.0
GRAPHQL_API_KEY=internal_service_key
```

---

## Deployment Scenarios

### Scenario 1: Single Server Deployment

**Use Case**: Small teams, testing, or low-traffic production

The example `docs/examples/docker-compose.yml` provides a single-server deployment with all services on one host.

**Pros:**

- Simple setup
- Easy management
- Low resource requirements

**Cons:**

- No redundancy
- Limited scalability
- Single point of failure

**Recommended for**: Teams up to 50 users

### Scenario 2: Multi-Server Deployment

**Use Case**: Production environments with high availability requirements

Separate services across multiple servers:

- **Server 1**: PostgreSQL, Keycloak Database
- **Server 2**: Keycloak, Typesense
- **Server 3**: Backend, Frontend
- **Server 4**: Ollama (optional)

**Configuration Changes:**

Update `.env` to point to remote services:

```bash
DATABASE_URL="postgresql://user:pass@db-server.internal:5432/georgeai"
KEYCLOAK_URL=https://auth.yourdomain.com
TYPESENSE_HOST=search-server.internal
OLLAMA_BASE_URL=http://ai-server.internal:11434
```

**Pros:**

- Better performance
- Horizontal scalability
- Service isolation

**Cons:**

- More complex setup
- Network configuration required
- Higher infrastructure costs

**Recommended for**: Teams over 50 users, high-traffic deployments

### Scenario 3: Kubernetes Deployment

**Use Case**: Enterprise environments with auto-scaling requirements

George AI can be deployed to Kubernetes using Helm charts (coming soon) or custom manifests.

**Key Considerations:**

1. **StatefulSets** for databases (PostgreSQL, Typesense)
2. **Deployments** for stateless services (Frontend, Backend, Keycloak)
3. **Persistent Volumes** for data storage
4. **Ingress** for SSL/TLS termination
5. **ConfigMaps** and **Secrets** for configuration

**Example structure:**

```
k8s/
├── postgres/
│   ├── statefulset.yaml
│   ├── service.yaml
│   └── pvc.yaml
├── keycloak/
│   ├── deployment.yaml
│   └── service.yaml
├── typesense/
│   ├── statefulset.yaml
│   └── service.yaml
├── backend/
│   ├── deployment.yaml
│   └── service.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
└── ingress.yaml
```

**Recommended for**: Large enterprises, multi-tenant deployments

### Scenario 4: Multi-Tenant Deployment

**Use Case**: SaaS providers hosting George AI for multiple customers

Each tenant gets isolated:

- **Option A**: Separate database schemas (shared infrastructure)
- **Option B**: Separate containers per tenant (full isolation)

**Architecture:**

```
Reverse Proxy (Traefik/Nginx)
  ├── tenant1.yourdomain.com → Frontend (Tenant 1) → Backend (Tenant 1)
  ├── tenant2.yourdomain.com → Frontend (Tenant 2) → Backend (Tenant 2)
  └── tenant3.yourdomain.com → Frontend (Tenant 3) → Backend (Tenant 3)

Shared Services:
  - PostgreSQL (separate schemas: tenant1, tenant2, tenant3)
  - Keycloak (separate realms: tenant1, tenant2, tenant3)
  - Typesense (separate collections per tenant)
```

**Configuration per tenant:**

```bash
# Tenant 1
KEYCLOAK_REALM=tenant1
DATABASE_URL="postgresql://user:pass@db:5432/georgeai?schema=tenant1"
PUBLIC_APP_URL=https://tenant1.yourdomain.com
```

**Recommended for**: Managed service providers

---

## Backup and Restore

### What to Backup

1. **PostgreSQL Database** - User data, libraries, files metadata
2. **Typesense Data** - Vector embeddings and search indices
3. **File Storage** - Uploaded files (PDFs, documents, media)
4. **Keycloak Database** - User authentication data

### Backup Procedures

#### 1. PostgreSQL Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U george georgeai > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups
cat > /etc/cron.daily/backup-george-ai << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/george-ai
mkdir -p $BACKUP_DIR
docker compose exec -T postgres pg_dump -U george georgeai | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF
chmod +x /etc/cron.daily/backup-george-ai
```

#### 2. Keycloak Database Backup

```bash
docker compose exec keycloak-db pg_dump -U keycloak keycloak > keycloak_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 3. File Storage Backup

```bash
# Create tarball of storage volume
docker run --rm -v george-ai_backend_storage:/data -v $(pwd):/backup alpine tar czf /backup/storage_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

#### 4. Typesense Backup

```bash
# Backup Typesense data directory
docker run --rm -v george-ai_typesense_data:/data -v $(pwd):/backup alpine tar czf /backup/typesense_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Restore Procedures

#### 1. Restore PostgreSQL Database

```bash
# Stop services
docker compose down

# Restore database
docker compose up -d postgres
docker compose exec -T postgres psql -U george -d georgeai < backup_20250129_120000.sql

# Start all services
docker compose up -d
```

#### 2. Restore File Storage

```bash
docker compose down
docker run --rm -v george-ai_backend_storage:/data -v $(pwd):/backup alpine tar xzf /backup/storage_20250129_120000.tar.gz -C /data
docker compose up -d
```

#### 3. Restore Typesense

```bash
docker compose down
docker run --rm -v george-ai_typesense_data:/data -v $(pwd):/backup alpine tar xzf /backup/typesense_20250129_120000.tar.gz -C /data
docker compose up -d
```

---

## Monitoring and Logging

### Health Checks

All services include health check endpoints:

```bash
# Backend
curl http://localhost:3003/health

# Keycloak
curl http://localhost:8180/health/ready

# Typesense
curl http://localhost:8108/health

# PostgreSQL
docker compose exec postgres pg_isready -U george
```

### Logging

#### View Service Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f keycloak

# Last 100 lines
docker compose logs --tail=100 backend
```

#### Configure Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Monitoring with Prometheus and Grafana (Optional)

Add monitoring stack to your `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  ports:
    - '9090:9090'

grafana:
  image: grafana/grafana:latest
  volumes:
    - grafana_data:/var/lib/grafana
  ports:
    - '3000:3000' # Note: Grafana uses port 3000 (separate from George AI frontend on 3001)
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Access Grafana**: http://localhost:3000 (default credentials: admin/admin)

**Key Metrics to Monitor:**

- CPU and memory usage per service
- Database connection pool utilization
- GraphQL query performance
- Typesense query latency
- File storage disk usage
- Keycloak authentication success/failure rates

---

## Scaling and Performance

### Vertical Scaling

Increase resources for individual services:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 8G
      reservations:
        cpus: '2'
        memory: 4G
```

### Horizontal Scaling

Run multiple instances of stateless services:

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Requires load balancer (Nginx, Traefik, HAProxy)
```

### Database Optimization

#### PostgreSQL Tuning

Add to your `docker-compose.yml`:

```yaml
postgres:
  command: postgres -c shared_buffers=2GB -c effective_cache_size=6GB -c max_connections=200
```

#### Connection Pooling

Use PgBouncer for connection pooling:

```yaml
pgbouncer:
  image: pgbouncer/pgbouncer:latest
  environment:
    DATABASE_URL: postgresql://george:password@postgres:5432/georgeai
    POOL_MODE: transaction
    MAX_CLIENT_CONN: 1000
    DEFAULT_POOL_SIZE: 25
  ports:
    - '6432:6432'
```

Update backend `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://george:password@pgbouncer:6432/georgeai"
```

### Typesense Performance

#### Memory Configuration

```yaml
typesense:
  command: '--data-dir /data --api-key=xyz --enable-cors --cache-size-mb=4096'
```

#### Multiple Typesense Nodes

For high-availability:

```yaml
typesense-1:
  image: typesense/typesense:27.1
  command: '--data-dir /data --api-key=xyz --peering-address=typesense-1:8107 --nodes=typesense-1:8107,typesense-2:8107,typesense-3:8107'

typesense-2:
  image: typesense/typesense:27.1
  command: '--data-dir /data --api-key=xyz --peering-address=typesense-2:8107 --nodes=typesense-1:8107,typesense-2:8107,typesense-3:8107'

typesense-3:
  image: typesense/typesense:27.1
  command: '--data-dir /data --api-key=xyz --peering-address=typesense-3:8107 --nodes=typesense-1:8107,typesense-2:8107,typesense-3:8107'
```

### CDN for Static Assets

Use a CDN (Cloudflare, AWS CloudFront) for frontend static files to reduce server load.

---

## Security Best Practices

### 1. Use Strong Passwords

Generate secure passwords for all services:

```bash
# Generate random passwords
openssl rand -base64 32
```

Update in `.env`:

- `DB_PASSWORD`
- `KEYCLOAK_ADMIN_PASSWORD`
- `KEYCLOAK_DB_PASSWORD`
- `TYPESENSE_API_KEY`
- `GRAPHQL_API_KEY`

### 2. Enable SSL/TLS

Use a reverse proxy with automatic SSL certificates:

#### Nginx with Let's Encrypt

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Traefik (Automatic SSL)

```yaml
traefik:
  image: traefik:v2.10
  command:
    - '--providers.docker=true'
    - '--entrypoints.web.address=:80'
    - '--entrypoints.websecure.address=:443'
    - '--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com'
    - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
    - '--certificatesresolvers.letsencrypt.acme.tlschallenge=true'
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - letsencrypt:/letsencrypt

frontend:
  labels:
    - 'traefik.enable=true'
    - 'traefik.http.routers.frontend.rule=Host(`yourdomain.com`)'
    - 'traefik.http.routers.frontend.entrypoints=websecure'
    - 'traefik.http.routers.frontend.tls.certresolver=letsencrypt'
```

### 3. Network Isolation

Use Docker networks to isolate services:

```yaml
networks:
  frontend:
  backend:
  database:

services:
  frontend:
    networks:
      - frontend
      - backend

  backend:
    networks:
      - backend
      - database

  postgres:
    networks:
      - database
```

### 4. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 5. Regular Updates

```bash
# Update Docker images
docker compose pull
docker compose up -d

# Update system packages
sudo apt update && sudo apt upgrade -y
```

### 6. Secrets Management

Use Docker secrets or external secret managers (HashiCorp Vault, AWS Secrets Manager):

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

### 7. Security Headers

Configure security headers in reverse proxy:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

---

## Upgrade Procedures

### Minor Updates (Patch/Minor Versions)

```bash
# 1. Backup database
docker compose exec postgres pg_dump -U george georgeai > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull new images
docker compose pull

# 3. Restart services
docker compose up -d

# 4. Verify health
docker compose ps
curl http://localhost:3003/graphql
```

### Major Updates (Breaking Changes)

```bash
# 1. Read release notes and migration guide
# Check https://github.com/progwise/george-ai/releases

# 2. Backup everything (database + storage + typesense)
docker compose exec postgres pg_dump -U george georgeai > backup_$(date +%Y%m%d_%H%M%S).sql
docker run --rm -v george-ai_backend_storage:/data -v $(pwd):/backup alpine tar czf /backup/storage_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
docker run --rm -v george-ai_typesense_data:/data -v $(pwd):/backup alpine tar czf /backup/typesense_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# 3. Stop services
docker compose down

# 4. Update your docker-compose.yml and .env if required (check release notes)

# 5. Pull new images
docker compose pull

# 6. Run database migrations
docker compose up -d postgres
docker compose exec backend sh -c "cd /app/node_modules/@george-ai/pothos-graphql && npx prisma migrate deploy"

# 7. Start all services
docker compose up -d

# 8. Verify functionality
```

### Rollback Procedure

```bash
# 1. Stop services
docker compose down

# 2. Restore database backup
docker compose up -d postgres
docker compose exec -T postgres psql -U george -d georgeai < backup_20250129_120000.sql

# 3. Start services with previous version
docker compose up -d
```

---

## Troubleshooting

### Service Won't Start

**Check logs:**

```bash
docker compose logs backend
docker compose logs frontend
```

**Common issues:**

1. **Port already in use**

   ```bash
   # Find process using port
   sudo lsof -i :3001
   # Kill process or change port in .env
   ```

2. **Database connection failed**

   ```bash
   # Verify database is running
   docker compose ps postgres
   # Check DATABASE_URL in .env
   # Test connection
   docker compose exec backend sh -c 'node -e "console.log(process.env.DATABASE_URL)"'
   ```

3. **Out of memory**
   ```bash
   # Check Docker memory limits
   docker stats
   # Increase Docker Desktop memory in settings
   # Or add swap on Linux
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Authentication Issues

**Keycloak not accessible:**

```bash
# Check Keycloak health
curl http://localhost:8180/health/ready

# Check logs
docker compose logs keycloak

# Verify realm and client configuration
# Realm name must match KEYCLOAK_REALM in .env
# Client ID must match KEYCLOAK_CLIENT_ID in .env
```

**Redirect URI mismatch:**

- Verify `KEYCLOAK_REDIRECT_URL` matches the URL users access
- Add all possible URLs to Keycloak client settings
- Check browser console for error messages

### Performance Issues

**Slow queries:**

```bash
# Enable PostgreSQL slow query logging
docker compose exec postgres psql -U george -d georgeai -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
docker compose restart postgres

# Check slow queries
docker compose exec postgres psql -U george -d georgeai -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**High CPU usage:**

```bash
# Check per-service CPU usage
docker stats

# Limit CPU for specific service
docker compose stop backend
# Add to docker-compose.yml under backend service:
#   deploy:
#     resources:
#       limits:
#         cpus: '2'
docker compose up -d backend
```

### File Upload Issues

**Uploads failing:**

```bash
# Check storage permissions
docker compose exec backend ls -la /app/storage

# Check disk space
df -h

# Check upload size limits (set in backend .env)
docker compose exec backend sh -c 'node -e "console.log(process.env.MAX_FILE_SIZE)"'
```

### Typesense Search Not Working

**Check Typesense health:**

```bash
curl http://localhost:8108/health

# Verify API key
docker compose exec backend sh -c 'node -e "console.log(process.env.TYPESENSE_API_KEY)"'

# Check collections
curl -H "X-TYPESENSE-API-KEY: xyz" http://localhost:8108/collections

# Rebuild indices (from George AI admin panel)
# Navigate to: Settings → Search → Rebuild Indices
```

### Container Crashes on Startup

**Check logs:**

```bash
docker compose logs --tail=100 backend
```

**Common causes:**

1. **Environment variable missing**
   - Check `.env` file has all required variables
   - Compare with `.env.example`

2. **Database migration failed**

   ```bash
   # Run migrations manually
   docker compose exec backend sh -c "cd /app/node_modules/@george-ai/pothos-graphql && npx prisma migrate deploy"
   ```

3. **Dependency conflict**
   ```bash
   # Clear volumes and rebuild
   docker compose down -v
   docker compose build --no-cache
   docker compose up -d
   ```

### Getting Help

1. **Documentation**: https://george-ai.net/docs
2. **GitHub Issues**: https://github.com/progwise/george-ai/issues
3. **Discord Community**: https://discord.gg/GbQFKb2MNJ
4. **Developer Setup Guide**: See `docs/developer-setup.md` for development environment setup

---

## Next Steps

After successful deployment:

1. **Configure AI Services**: Set up OpenAI, Ollama, or other AI providers in Settings → AI Services
2. **Create Libraries**: Organize your data by business case using Libraries
3. **Set Up Crawlers**: Configure data sources (SharePoint, Google Drive, file uploads)
4. **Define Enrichments**: Add custom fields and AI enrichments for your data
5. **Integrate with n8n**: Use the GraphQL API to build automation workflows
6. **Invite Users**: Add team members via Keycloak user management

For detailed user guides, see the [User Documentation](https://george-ai.net/docs).

For developer setup and contributing, see [Developer Setup Guide](./developer-setup.md) and [Contributing Guide](./contributing.md).
