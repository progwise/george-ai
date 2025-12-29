# Event Service Client

Provider-agnostic event messaging client for George AI.

**Current implementation:** NATS JetStream
**Future:** Can be switched to RabbitMQ, Kafka, etc. without breaking existing code

## Features

- ✅ **Provider-agnostic** - Clean abstraction, no vendor lock-in
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Workspace isolation** - Events scoped per workspace
- ✅ **Consumer groups** - Built-in support for horizontal scaling
- ✅ **Request/Reply** - Synchronous RPC-style operations
- ✅ **Factory pattern** - Flexible client lifecycle management

## Installation

```bash
pnpm add @george-ai/event-service-client
```

## Usage

### Basic Setup

```typescript
import { createEventClient } from '@george-ai/event-service-client'

// Create client (uses environment variables by default)
const client = await createEventClient()

// Or provide custom config
const client = await createEventClient({
  servers: 'nats://my-nats:4222',
  user: 'myuser',
  pass: 'mypass',
})
```

### Publishing Events

```typescript
import { createEventClient } from '@george-ai/event-service-client'

const client = await createEventClient()

await client.publishEvent({
  workspaceId: 'workspace-123',
  eventType: 'file-uploaded',
  payload: {
    fileId: 'file-456',
    fileName: 'document.pdf',
    size: 1024000,
  },
  timeoutMs: 5000, // optional, defaults to 5000
})
```

### Subscribing to Events

```typescript
import { createEventClient } from '@george-ai/event-service-client'

const client = await createEventClient()

// Subscribe with consumer group (competing consumers)
const cleanup = await client.subscribe({
  workspaceId: 'workspace-123',
  eventType: 'file-uploaded',
  consumerName: 'file-processor-worker', // Consumer group name
  handler: async (payload) => {
    console.log('File uploaded:', payload.fileName)
    // Process file...
  },
})

// Later: cleanup subscription
await cleanup()
```

### Request/Reply Pattern

Used by workers to provide synchronous services (e.g., ai-service-worker):

```typescript
import { createEventClient } from '@george-ai/event-service-client'

const client = await createEventClient()

// Service worker responds to requests
const cleanup = await client.respond<{ text: string; modelName: string }, { vectors: number[] }>({
  subject: 'ai-service.embed',
  handler: async (request) => {
    const vectors = await generateEmbedding(request.text, request.modelName)
    return { vectors }
  },
})

// Client makes request
const response = await client.request<{ text: string; modelName: string }, { vectors: number[] }>({
  subject: 'ai-service.embed',
  payload: {
    text: 'Hello world',
    modelName: 'text-embedding-3-small',
  },
  timeoutMs: 30000,
})

console.log('Embeddings:', response.vectors)
```

### Admin Operations

```typescript
import { createEventClient } from '@george-ai/event-service-client'

const client = await createEventClient()

// Delete all events for a workspace
await client.deleteWorkspaceStream('workspace-123')

// Delete a specific consumer
await client.deleteConsumer('workspace-123', 'file-processor-worker')
```

### Graceful Shutdown

```typescript
import { createEventClient } from '@george-ai/event-service-client'

const client = await createEventClient()

// Cleanup on process exit
process.on('SIGTERM', async () => {
  await client.disconnect()
  process.exit(0)
})
```

## Environment Variables

```bash
NATS_URL=nats://gai-nats:4222  # NATS server URL (default)
NATS_USER=                      # Optional: NATS username
NATS_PASSWORD=                  # Optional: NATS password
NATS_TOKEN=                     # Optional: NATS token auth
```

## Architecture

### Workspace Isolation

Events are automatically scoped to workspaces:

- Subject pattern: `workspace.{workspaceId}.events.{eventType}`
- Stream per workspace: `workspace-{workspaceId}`
- Consumers can filter by event type

### Consumer Groups

Multiple workers can subscribe to the same event type using the same `consumerName`. NATS ensures only ONE worker processes each message (competing consumers pattern).

**Example:**

```typescript
// Worker 1
await client.subscribe({
  workspaceId: 'workspace-123',
  eventType: 'file-embedding-request',
  consumerName: 'embedding-workers', // Same group
  handler: async (payload) => {
    /* ... */
  },
})

// Worker 2 (different process/server)
await client.subscribe({
  workspaceId: 'workspace-123',
  eventType: 'file-embedding-request',
  consumerName: 'embedding-workers', // Same group
  handler: async (payload) => {
    /* ... */
  },
})

// Result: Each event processed by only ONE worker
```

## Why Provider-Agnostic?

The package exposes only the `EventClient` interface, not NATS-specific types. This allows switching to another message broker (RabbitMQ, Kafka, Redis Streams) without changing any consuming code.

**What's hidden:**

- ❌ NATS connection objects
- ❌ JetStream managers
- ❌ Stream/consumer configuration
- ❌ NATS-specific error types

**What's exposed:**

- ✅ `publishEvent()` - Generic event publishing
- ✅ `subscribe()` - Generic event subscribing
- ✅ `request()` / `respond()` - Generic RPC
- ✅ Admin operations

## Testing

```bash
# Run tests (requires NATS running)
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Integration Example

See `@george-ai/workspace-events` package for a complete integration example using Zod schemas for type-safe events.
