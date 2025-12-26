# @george-ai/events

Event-driven architecture package for George AI, providing type-safe event definitions and NATS JetStream client utilities.

## Features

- ✅ Type-safe event definitions
- ✅ NATS JetStream client with workspace isolation
- ✅ Consumer groups for horizontal scaling
- ✅ Durable event delivery with JetStream
- ✅ Comprehensive test suite

## Architecture

George AI uses NATS JetStream for event-driven communication between services:

- **Workspace Isolation**: Each workspace has its own NATS stream (`workspace_{id}`)
- **Event Types**: FileExtracted, FileEmbedded, FileEmbeddingFailed
- **Subject Format**: `workspace_{id}.{event-type}` (e.g., `workspace_123.file-extracted`)
- **Consumer Groups**: Competing consumers for horizontal scaling

## Installation

This package is part of the George AI monorepo and is available as a workspace package:

```bash
pnpm add @george-ai/events
```

## Usage

### Connecting to NATS

```typescript
import { createNatsClient } from '@george-ai/events'

const client = await createNatsClient({
  servers: 'nats://gai-nats:4222',
  // Optional authentication
  user: 'user',
  pass: 'password',
  // Or use token
  token: 'my-token',
})
```

### Publishing Events

```typescript
import { createFileExtractedEvent } from '@george-ai/events'

// Create event
const event = createFileExtractedEvent({
  workspaceId: 'workspace-123',
  libraryId: 'lib-456',
  fileId: 'file-789',
  fileName: 'document.pdf',
  markdownPath: 'file-789/markdown.md',
  embeddingModelId: 'model-123',
  embeddingModelName: 'text-embedding-ada-002',
  embeddingModelProvider: 'openai',
  embeddingDimensions: 1536,
})

// Publish to workspace stream
await client.publish('workspace-123', event)
```

### Subscribing to Events

```typescript
import type { FileExtractedEvent } from '@george-ai/events'

// Subscribe to specific event type
const cleanup = await client.subscribe<FileExtractedEvent>(
  'workspace-123',
  'FileExtracted',
  'my-consumer-name',
  async (event, msg) => {
    console.log('Received event:', event)

    // Process event
    await processFile(event)

    // Message is automatically acknowledged after handler completes
    // If handler throws, message is negatively acknowledged and will be redelivered
  },
)

// Clean up when done
await cleanup()
```

### Subscribing to All Events

```typescript
import { isFileEmbeddedEvent, isFileExtractedEvent } from '@george-ai/events'

const cleanup = await client.subscribeAll('workspace-123', 'all-events-consumer', async (event, msg) => {
  if (isFileExtractedEvent(event)) {
    console.log('File extracted:', event.fileName)
  } else if (isFileEmbeddedEvent(event)) {
    console.log('File embedded:', event.chunksCount, 'chunks')
  }
})
```

### Consumer Groups (Competing Consumers)

Multiple consumers with the **same consumer name** form a consumer group where only one consumer receives each message:

```typescript
// Worker 1
await client.subscribe(
  'workspace-123',
  'FileExtracted',
  'embedding-workers', // Same consumer name
  async (event) => {
    await generateEmbeddings(event)
  },
)

// Worker 2 (on different server)
await client.subscribe(
  'workspace-123',
  'FileExtracted',
  'embedding-workers', // Same consumer name
  async (event) => {
    await generateEmbeddings(event)
  },
)

// Events will be distributed between Worker 1 and Worker 2
```

## Event Types

### FileExtractedEvent

Published when a file has been successfully extracted to Markdown.

```typescript
interface FileExtractedEvent {
  type: 'FileExtracted'
  workspaceId: string
  libraryId: string
  fileId: string
  fileName: string
  markdownPath: string // Relative path: 'fileId/markdown.md'

  // Embedding configuration
  embeddingModelId: string
  embeddingModelName: string
  embeddingModelProvider: string
  embeddingDimensions: number

  part?: number // For multi-part files
  timestamp: string
}
```

### FileEmbeddedEvent

Published when a file has been successfully embedded in Qdrant.

```typescript
interface FileEmbeddedEvent {
  type: 'FileEmbedded'
  workspaceId: string
  fileId: string
  processingTaskId: string

  qdrantCollection: string // workspace_{workspaceId}
  qdrantNamedVector: string // model_{embeddingModelId}
  chunksCount: number
  chunksSize: number

  part?: number
  timestamp: string
}
```

### FileEmbeddingFailedEvent

Published when embedding fails.

```typescript
interface FileEmbeddingFailedEvent {
  type: 'FileEmbeddingFailed'
  workspaceId: string
  fileId: string
  processingTaskId: string
  errorMessage: string
  timestamp: string
}
```

## Stream and Consumer Management

### Create Stream Manually

```typescript
await client.createStream({
  name: 'workspace_123',
  subjects: ['workspace_123.*'],
  description: 'Events for workspace 123',
  maxAge: 7 * 24 * 60 * 60 * 1e9, // 7 days retention
})
```

### Create Consumer Manually

```typescript
await client.createConsumer({
  streamName: 'workspace_123',
  consumerName: 'my-consumer',
  filterSubject: 'workspace_123.file-extracted',
  ackPolicy: AckPolicy.Explicit,
  maxDeliver: -1, // Unlimited retries
  ackWait: 30 * 1e9, // 30 seconds
})
```

## Testing

The package includes comprehensive integration tests that require a running NATS server:

```bash
# Start NATS server (from monorepo root)
docker-compose up gai-nats

# Run tests
cd packages/events
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Environment Variables

```bash
# NATS server URL (default: nats://gai-nats:4222)
NATS_URL=nats://localhost:4222

# Optional authentication
NATS_USER=user
NATS_PASSWORD=password
# Or use token
NATS_TOKEN=my-token
```

## Best Practices

### 1. Consumer Naming

- Use **same consumer name** for competing consumers (horizontal scaling)
- Use **different consumer names** for different consumers (all receive messages)

### 2. Error Handling

```typescript
await client.subscribe('workspace-123', 'FileExtracted', 'worker', async (event, msg) => {
  try {
    await processFile(event)
    // Message automatically acknowledged
  } catch (error) {
    console.error('Processing failed:', error)
    // Message automatically negatively acknowledged (will be redelivered)
    throw error
  }
})
```

### 3. Graceful Shutdown

```typescript
// Store cleanup functions
const cleanups: Array<() => Promise<void>> = []

cleanups.push(await client.subscribe('workspace-123', 'FileExtracted', 'worker', handler))

// On shutdown
for (const cleanup of cleanups) {
  await cleanup()
}

await client.disconnect()
```

### 4. Workspace Isolation

Always include `workspaceId` in events and use it for subscription filtering:

```typescript
// ✅ Good - workspace isolation
await client.subscribe('workspace-123', 'FileExtracted', 'worker', handler)

// ❌ Bad - no workspace isolation
await client.subscribeAll('*', 'worker', handler)
```

## Architecture Principles

### Database Access: Backend Only

**🚨 ONLY BACKEND ACCESSES DATABASE (Prisma) 🚨**

- **Backend API**: Has Prisma access, queries database for event data
- **Workers**: NO database access, receive ALL data via events
- **Events Package**: No database dependency

**Why:** Workers remain stateless, scalable, and deployable anywhere without database credentials.

### Service Exposure: Internal by Default

**🔒 ONLY BACKEND EXPOSED TO INTERNET 🔒**

- **Backend API**: Only public service (GraphQL, REST)
- **Workers**: Internal only (embedding, extraction, enrichment)
- **NATS**: Internal only (no internet exposure)

**Why:** Reduced attack surface, simpler services, centralized authentication.

## License

SEE LICENSE IN LICENSE

## Author

Michael Vogt <info@george-ai.net>

## Repository

https://github.com/progwise/george-ai
