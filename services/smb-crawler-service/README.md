# SMB Crawler Service

HTTP + SSE microservice for crawling SMB/CIFS file shares using native SMB2 protocol.

## Features

- 🔌 **REST API** - Simple HTTP endpoints
- 📡 **SSE Streaming** - Real-time file discovery events
- 🔒 **Direct SMB2 Access** - Native protocol, no filesystem mounts
- 🗄️ **Job Management** - Automatic cleanup after 1 hour
- 📊 **Health Checks** - Production-ready monitoring
- 🐳 **Docker Ready** - Containerized deployment

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start service
pnpm start

# Service runs on http://localhost:3006
```

### Docker

```bash
# Build image
docker build -t smb-crawler .

# Run container
docker run -p 3006:3006 smb-crawler
```

## API Reference

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "service": "smb-crawler",
  "version": "1.0.0"
}
```

---

### Start Crawl Job

```http
POST /crawl/start
Content-Type: application/json

{
  "uri": "//fileserver/share",
  "username": "user",
  "password": "pass",
  "includePatterns": ["*.pdf", "*.docx"],
  "excludePatterns": ["**/temp/**"],
  "maxFileSizeBytes": 104857600
}
```

**Response:**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "streamUrl": "/crawl/550e8400-e29b-41d4-a716-446655440000/stream"
}
```

**Request Body:**

- `uri` (required) - SMB share URI (e.g., `//server/share/path` or `smb://server/share/path`)
- `username` (required) - SMB username (supports `DOMAIN\user` format)
- `password` (required) - SMB password
- `includePatterns` (optional) - Array of glob patterns
- `excludePatterns` (optional) - Array of glob patterns
- `maxFileSizeBytes` (optional) - Maximum file size (bytes)

**Status Codes:**

- `200` - Success
- `400` - Invalid request (validation error)
- `500` - Server error (connection failed, etc.)

---

### Stream Crawl Events (SSE)

```http
GET /crawl/:jobId/stream
```

**Response:** Server-Sent Events stream

**Event Types:**

#### `file-found`

```
event: file-found
data: {"fileId":"abc123","name":"document.pdf","relativePath":"folder/document.pdf","size":5242880,"mimeType":"application/pdf","lastModified":"2024-01-15T10:30:00Z","hash":"sha256...","downloadUrl":"/files/550e8400-e29b-41d4-a716-446655440000/abc123"}
```

#### `progress`

```
event: progress
data: {"filesFound":150,"filesMatched":75,"totalBytes":52428800,"currentDirectory":"/folder"}
```

#### `complete`

```
event: complete
data: {"totalFiles":200,"totalMatched":150,"totalBytes":104857600,"durationMs":5000}
```

#### `error`

```
event: error
data: {"message":"Failed to access directory: Permission denied"}
```

**Status Codes:**

- `200` - Stream started
- `404` - Job not found

---

### Download File

```http
GET /files/:jobId/:fileId
```

**Response:** Binary file stream

**Headers:**

- `Content-Type` - File MIME type (e.g., `application/pdf`)
- `Content-Length` - File size in bytes
- `Content-Disposition` - Filename for download

**Status Codes:**

- `200` - Success
- `404` - Job or file not found
- `500` - File read error

---

### Cancel Job

```http
DELETE /crawl/:jobId
```

Cancels job, closes SMB connection, and cleans up resources.

**Response:**

```json
{
  "success": true
}
```

**Status Codes:**

- `200` - Success
- `500` - Cleanup error

---

### List Active Connections (Debug)

```http
GET /connections
```

**Response:**

```json
{
  "success": true,
  "connections": [
    {
      "crawlerId": "550e8400-e29b-41d4-a716-446655440000",
      "sharePath": ""
    }
  ]
}
```

---

### Get Active Jobs (Debug)

```http
GET /jobs
```

**Response:**

```json
{
  "success": true,
  "jobs": [
    {
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "running",
      "filesFound": 150,
      "clients": 1
    }
  ]
}
```

## Architecture

### Flow Diagram

```
┌─────────┐     POST /crawl/start      ┌──────────────┐
│ Client  │ ───────────────────────────>│ SMB Crawler  │
│         │ <───────────────────────────│   Service    │
└─────────┘   { jobId, streamUrl }      └──────────────┘
     │                                         │
     │        GET /crawl/:jobId/stream         │
     │ ────────────────────────────────────────>
     │ <────────────────────────────────────────
     │         SSE: file-found events           │
     │                                          │
     │         GET /files/:jobId/:fileId        │
     │ ────────────────────────────────────────>
     │ <────────────────────────────────────────
     │            Binary stream                 │
     │                                          │
     │        DELETE /crawl/:jobId              │
     │ ────────────────────────────────────────>
```

### Components

#### 1. **Job Manager** (`job-manager.ts`)

- Creates and tracks crawl jobs
- Manages SSE client connections
- Handles automatic cleanup (1 hour TTL)
- Stores file metadata for downloads

#### 2. **Connection Manager** (`connection-manager.ts`)

- Manages SMB2 client connections
- Parses SMB URIs and credentials
- Handles connection lifecycle (connect/disconnect)
- Connection pooling per crawler job

#### 3. **File Crawler** (`file-crawler.ts`)

- Walks directory trees recursively using SMB2 protocol
- Filters files by patterns (include/exclude)
- Respects file size limits
- Calculates SHA-256 hashes via SMB2 streams
- Emits progress events

#### 4. **HTTP API** (`index.ts`)

- Express server with REST + SSE endpoints
- Request validation (Zod schemas)
- Error handling and logging
- Health checks

## Deployment

### Environment Variables

```bash
PORT=3006                    # HTTP port (default: 3006)
NODE_ENV=production          # Environment
LOG_LEVEL=info              # Logging level
```

### Docker Compose

```yaml
services:
  smb-crawler:
    image: ghcr.io/progwise/george-ai/smb-crawler:latest
    ports:
      - '3006:3006'
    environment:
      PORT: 3006
      NODE_ENV: production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3006/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

### Docker Swarm

```yaml
services:
  gai-smb-crawler:
    image: ghcr.io/progwise/george-ai/smb-crawler:latest
    networks:
      - george-ai-network
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: any
        delay: 5s
        window: 120s
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3006/health']
      interval: 30s
      timeout: 10s
      retries: 3

  gai-backend:
    environment:
      SMB_CRAWLER_URL: http://gai-smb-crawler:3006
    depends_on:
      - gai-smb-crawler
```

## Security Considerations

### SMB2 Protocol Security

The service uses native SMB2/3 protocol with the following security features:

- **NTLM Authentication** - Secure authentication with domain support
- **Connection Isolation** - Each job has its own SMB2 connection
- **Credential Protection** - Credentials only in memory, never written to disk
- **Automatic Cleanup** - Connections closed after job completion or timeout

### Input Validation

All requests are validated using Zod schemas:

- URI format checking
- Pattern sanitization
- File size limits
- Path traversal prevention

### Network Security

- **Firewall**: Ensure SMB port 445/tcp is accessible from container
- **VPN**: Use VPN or private network for remote SMB shares
- **TLS**: SMB3 encryption supported (enabled by server)

## Monitoring

### Health Checks

```bash
# Check service health
curl http://localhost:3006/health

# List active jobs
curl http://localhost:3006/jobs

# List active connections
curl http://localhost:3006/connections
```

### Logs

The service logs to stdout/stderr:

- `[API]` - HTTP request/response logs
- `[JobManager]` - Job lifecycle events
- `[Connection]` - SMB2 connection operations
- `[Crawler]` - File discovery progress

Example:

```
[API] POST /crawl/start
[JobManager] Creating job 550e8400-e29b-41d4-a716-446655440000
[Connection] Connecting to fileserver:445, share: share
[Connection] Success: 550e8400-e29b-41d4-a716-446655440000
[Crawler] Found file: document.pdf (5242880 bytes)
[JobManager] Job 550e8400-e29b-41d4-a716-446655440000 completed: 200 files in 5000ms
[Disconnect] Success: 550e8400-e29b-41d4-a716-446655440000
```

## Troubleshooting

### Connection Fails with "Permission Denied"

**Problem:** SMB credentials invalid or share not accessible

**Solution:**

- Verify username/password
- Test connectivity: `smbclient //server/share -U username`
- Check firewall rules (port 445/tcp)
- Verify SMB server allows SMB2/3 protocol

### "ECONNREFUSED" or "ETIMEDOUT"

**Problem:** Cannot reach SMB server

**Solution:**

- Check network connectivity: `ping server`
- Verify SMB port is open: `telnet server 445`
- Check Docker network configuration
- Ensure SMB server is running

### Jobs Not Cleaning Up

**Problem:** Service crashed before cleanup

**Solution:**

- Restart service - automatic cleanup on startup
- Check logs for errors
- Manually cancel jobs via API: `DELETE /crawl/:jobId`

### SSE Connection Drops

**Problem:** Proxy/load balancer buffering SSE

**Solution:**

- Add `X-Accel-Buffering: no` header (Nginx)
- Increase timeout settings
- Use HTTP/2 for better connection handling

### "Hash Calculation Failed"

**Problem:** File read error during hash calculation

**Solution:**

- Check file permissions on SMB share
- Verify file is not locked by another process
- Check available memory (large files need buffering)

## Development

### Project Structure

```
services/smb-crawler-service/
├── src/
│   ├── index.ts              # HTTP API + Express server
│   ├── job-manager.ts        # Job lifecycle management
│   ├── connection-manager.ts # SMB2 connection management
│   ├── file-crawler.ts       # Directory walking + filtering
│   └── types.ts              # TypeScript types
├── Dockerfile                # Multi-stage build
├── package.json
└── tsconfig.json
```

### Testing

```bash
# Start service
pnpm start

# In another terminal, test API
curl -X POST http://localhost:3006/crawl/start \
  -H "Content-Type: application/json" \
  -d '{
    "uri": "//fileserver/share",
    "username": "testuser",
    "password": "testpass",
    "includePatterns": ["*.pdf"]
  }'

# Get jobId from response, then stream events
curl http://localhost:3006/crawl/:jobId/stream

# Download a file
curl http://localhost:3006/files/:jobId/:fileId -o file.pdf
```

### Local Development with Test Server

The development environment includes a test SMB server:

```bash
# Test server runs on port 10445 (mapped from container port 445)
# Access via: //localhost:10445/share

# Use test credentials from docker-compose.yml:
URI: //gai-smb-test/share
Username: testuser
Password: testpass
```

## Performance

### Benchmarks

Tested on:

- 10,000 files (500 GB total)
- Network: 1 Gbps
- CPU: 4 cores
- RAM: 4 GB

**Results:**

- Discovery: ~500-1,000 files/sec (depends on network latency)
- Download: Limited by network bandwidth
- Memory: ~100 MB baseline + 5-10 MB per active job
- Hash calculation: ~200 MB/s per file

### Tuning

Adjust resource limits in Docker Compose:

```yaml
resources:
  limits:
    cpus: '1.0' # More CPU = faster hash calculation
    memory: 1G # More RAM = more concurrent jobs
```

## SMB2 Protocol Details

This service uses a pure TypeScript SMB2/3 client implementation:

- **Protocol**: SMB 2.1 / 3.0 / 3.1.1
- **Authentication**: NTLM (NTLMv2)
- **Features**:
  - Directory listing
  - File reading via streams
  - Metadata queries (size, dates, attributes)
  - SHA-256 hash calculation

**Supported SMB Servers:**

- Windows Server 2008 R2 and later
- Windows 10/11 file shares
- Samba 4.x and later
- NAS devices with SMB2/3 support

## License

SEE LICENSE IN LICENSE (Business Source License 1.1)
