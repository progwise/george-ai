# @george-ai/workspace-events

Event-driven architecture package for George AI's content processing pipeline.

## Features

- ✅ **Simple API** - Just 2 functions: publish and subscribe
- ✅ **Type-safe events** - Zod validation with TypeScript types
- ✅ **Workspace isolation** - Each workspace has isolated event streams
- ✅ **Competing consumers** - Horizontal scaling with load balancing
- ✅ **Automatic retries** - Failed events are automatically redelivered
- ✅ **Singleton connection** - Connection management handled internally

## Architecture

George AI uses NATS JetStream for event-driven communication in the content processing pipeline:

- **Subject Format**: `workspace.{workspaceId}.events.{eventName}`
- **Stream per Workspace**: `workspace-{workspaceId}`
- **Consumer Groups**: Multiple workers with same consumer name = competing consumers
- **Connection Management**: Singleton connection from environment variables

## Installation

This package is part of the George AI monorepo:

```bash
pnpm add @george-ai/workspace-events
```

## Usage

### Publishing Events

```typescript
import { publishEmbeddingRequest } from '@george-ai/workspace-events'

await publishEmbeddingRequest({
  eventName: 'file-embedding-request',
  timestamp: new Date().toISOString(),
  timeoutMs: 600000, // 10 minutes
  processingTaskId: 'task-123',
  workspaceId: 'workspace-abc',
  libraryId: 'lib-456',
  fileId: 'file-789',
  markdownFilename: 'file-789/markdown.md',
  fileEmbeddingOptions: {
    embeddingModelName: 'text-embedding-3-small',
    embeddingModelProvider: 'openai',
  },
})
```

### Subscribing to Events

```typescript
import { subscribeEmbeddingRequests } from '@george-ai/workspace-events'

const cleanup = await subscribeEmbeddingRequests({
  consumerName: 'embedding-worker-1',
  workspaceId: 'workspace-abc',
  handler: async (event) => {
    console.log('Processing embedding request:', event.fileId)

    // Your processing logic here
    await generateEmbeddings(event)

    // Event is automatically acknowledged on success
    // If handler throws, event is negatively acknowledged and redelivered
  },
})

// Clean up when shutting down
await cleanup()
```

## Competing Consumers (Horizontal Scaling)

Multiple workers with the **same consumer name** form a consumer group where only one worker receives each event:

```typescript
// Worker 1
await subscribeEmbeddingRequests({
  consumerName: 'embedding-workers', // Same name
  workspaceId: 'workspace-abc',
  handler: async (event) => {
    await processEmbedding(event)
  },
})

// Worker 2 (on different server)
await subscribeEmbeddingRequests({
  consumerName: 'embedding-workers', // Same name
  workspaceId: 'workspace-abc',
  handler: async (event) => {
    await processEmbedding(event)
  },
})

// Events are automatically load-balanced between Worker 1 and Worker 2
```

## Event Types

### EmbeddingRequestEvent

Emitted when a file needs to be embedded (after extraction or on user request for re-embedding).

```typescript
interface EmbeddingRequestEvent {
  eventName: 'file-embedding-request'
  timestamp: string
  timeoutMs: number
  processingTaskId: string
  workspaceId: string
  libraryId: string
  fileId: string
  markdownFilename: string
  fileEmbeddingOptions: {
    embeddingModelName: string
    embeddingModelProvider: string
  }
  part?: number // For multi-part files
}
```

### Other Event Types

The package also supports:
- `ContentExtractionRequestEvent` - File needs extraction to markdown
- `ContentExtractionFinishedEvent` - Extraction completed
- `FileEmbeddingFinishedEvent` - Embedding completed

See `src/types.ts` for complete type definitions.

## Error Handling

Errors in event handlers trigger automatic retry with exponential backoff:

```typescript
await subscribeEmbeddingRequests({
  consumerName: 'worker',
  workspaceId: 'workspace-abc',
  handler: async (event) => {
    try {
      await processEmbedding(event)
      // ✅ Success - event is automatically acknowledged
    } catch (error) {
      console.error('Processing failed:', error)
      // ❌ Error - event is automatically negatively acknowledged
      // NATS will redeliver the event after a delay
      throw error
    }
  },
})
```

## Timeouts

Each event can specify its own timeout via `timeoutMs`. For long-running operations (e.g., large file embeddings):

```typescript
await publishEmbeddingRequest({
  // ... other fields
  timeoutMs: 3600000, // 1 hour for very large files
})
```

## Environment Variables

Connection is automatically established using these environment variables:

```bash
# NATS server URL (default: nats://gai-nats:4222)
NATS_URL=nats://gai-nats:4222

# Optional authentication
NATS_USER=username
NATS_PASSWORD=password
# Or use token authentication
NATS_TOKEN=my-secret-token

# Service name for consumer naming (default: unknown-service)
SERVICE_NAME=embedding-worker
```

## Testing

```bash
# Ensure NATS is running
docker-compose up gai-nats -d

# Run tests
cd packages/workspace-events
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Best Practices

### 1. Consumer Naming Strategy

```typescript
// ✅ Good - Use service name + event type
// Automatically generated: `${SERVICE_NAME}-${eventType}`
SERVICE_NAME=embedding-worker
// Consumer name becomes: "embedding-worker-file-embedding-request"

// ✅ Good - Explicit consumer name for competing consumers
consumerName: 'embedding-workers'

// ❌ Bad - Random consumer names (creates too many consumers)
consumerName: `worker-${Date.now()}`
```

### 2. Workspace Isolation

Always subscribe to specific workspaces:

```typescript
// ✅ Good - workspace isolation
await subscribeEmbeddingRequests({
  workspaceId: 'workspace-abc',
  // ...
})

// ❌ Bad - no package support for cross-workspace subscriptions
// Each workspace is isolated for security and fair processing
```

### 3. Graceful Shutdown

```typescript
const cleanup = await subscribeEmbeddingRequests({ /* ... */ })

// On SIGTERM or SIGINT
process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  await cleanup()
  await disconnect()
  process.exit(0)
})
```

### 4. Event Validation

Events are automatically validated with Zod schemas. Invalid events are logged and rejected:

```typescript
// This will be caught and logged automatically
await publishEmbeddingRequest({
  eventName: 'file-embedding-request',
  // Missing required fields - will fail validation
})
```

## Architecture Principles

### Database Access: Backend Only

**🚨 ONLY BACKEND ACCESSES DATABASE 🚨**

- **Backend**: Queries database, publishes events with ALL necessary data
- **Workers**: NO database access, receive complete data via events
- **Benefits**: Workers are stateless, scalable, deployable anywhere

### Service Exposure: Internal by Default

**🔒 ONLY BACKEND EXPOSED TO INTERNET 🔒**

- **Backend**: Public (GraphQL, REST, file serving)
- **Workers**: Internal only (embedding, extraction)
- **NATS**: Internal only (no internet exposure)
- **Benefits**: Reduced attack surface, simpler authentication

### Event-Driven Pipeline

```
User Upload → Backend → ContentExtractionRequestEvent → Extraction Worker
                ↓
         ContentExtractionFinishedEvent
                ↓
      EmbeddingRequestEvent → Embedding Worker
                ↓
     FileEmbeddingFinishedEvent → Backend updates DB
```

## Troubleshooting

### Connection Issues

```typescript
// Check NATS is running
docker-compose ps gai-nats

// Check connection from container
docker exec -it gai-backend nc -zv gai-nats 4222
```

### Events Not Being Received

1. Check consumer name matches between publisher expectations and subscriber
2. Verify workspace ID is correct
3. Check NATS streams: `docker exec gai-nats nats stream ls`
4. Check consumers: `docker exec gai-nats nats consumer ls workspace-{id}`

### Validation Errors

Events failing Zod validation are logged. Check event structure matches schema in `src/types.ts`.

## License

SEE LICENSE IN LICENSE

## Author

Michael Vogt <info@george-ai.net>

## Repository

https://github.com/progwise/george-ai
