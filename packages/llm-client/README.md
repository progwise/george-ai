# @george-ai/llm-client

A unified TypeScript client library for interacting with multiple LLM providers (OpenAI, Ollama) with a consistent streaming interface.

## Features

- **Multi-Provider Support**: OpenAI, Ollama, and Azure OpenAI compatible endpoints
- **Unified Streaming Interface**: Common `ChatCompletionStreamChunk` format across all providers
- **Token Usage Tracking**: Consistent metadata for prompt tokens, completion tokens, and total tokens
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **Abort Support**: Built-in request cancellation with AbortSignal
- **Load Balancing Ready**: Instance URL tracking for multi-instance setups
- **Retry Logic**: Automatic retries with exponential backoff (using p-retry)

## Installation

This is a workspace package and is used internally within the George AI monorepo.

```bash
pnpm add @george-ai/llm-client
```

## Usage

### Chat Completions (Unified Interface)

```typescript
import { chat } from '@george-ai/llm-client'

// Works with both Ollama and OpenAI
const stream = await chat({
  modelProvider: 'openai', // or 'ollama'
  modelName: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  connection: {
    providerBaseUrl: 'https://api.openai.com/v1',
    providerApiKey: process.env.OPENAI_API_KEY!,
  },
})

// Read the stream
const reader = stream.getReader()
let fullResponse = ''

while (true) {
  const { value, done } = await reader.read()
  if (done) break

  console.log('Chunk:', value.chunk)
  fullResponse += value.chunk

  // Access token usage metadata (when includeUsage: true)
  if (value.metadata?.tokensProcessed) {
    console.log('Tokens:', value.metadata.tokensProcessed)
  }
}
```

### Provider-Specific APIs

#### OpenAI

```typescript
import { openAiApi } from '@george-ai/llm-client'

// List available models
const models = await openAiApi.getOpenAIModels({
  url: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY!,
})

// Generate embeddings
const embeddings = await openAiApi.generateOpenAIEmbeddings(
  { url: 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY! },
  'text-embedding-3-small',
  ['Hello world', 'Another text'],
)

// Chat streaming with advanced options
const stream = await openAiApi.getChatResponseStream(
  { url: 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY! },
  'gpt-4o-mini',
  [{ role: 'user', content: 'Tell me a joke' }],
  {
    abortSignal: abortController.signal,
    includeUsage: true, // Get token usage in final chunk
  },
)
```

#### Ollama

```typescript
import { ollamaApi } from '@george-ai/llm-client'

// List available models
const models = await ollamaApi.getOllamaModels({
  url: 'http://localhost:11434',
  apiKey: '', // Optional
})

// Get running models
const runningModels = await ollamaApi.getOllamaRunningModels({
  url: 'http://localhost:11434',
})

// Get model info
const modelInfo = await ollamaApi.getOllamaModelInfo({ url: 'http://localhost:11434' }, 'llama3.2')

// Generate embeddings
const embeddings = await ollamaApi.generateOllamaEmbeddings(
  { url: 'http://localhost:11434' },
  'nomic-embed-text',
  'Hello world',
)

// Chat streaming
const stream = await ollamaApi.getChatResponseStream(
  { url: 'http://localhost:11434' },
  'llama3.2',
  [{ role: 'user', content: 'Hello!' }],
  {
    abortSignal: abortController.signal,
    includeUsage: true,
  },
)

// Load/unload models
await ollamaApi.loadOllamaModel({ url: 'http://localhost:11434' }, 'llama3.2')
await ollamaApi.unloadOllamaModel({ url: 'http://localhost:11434' }, 'llama3.2')
```

### Embeddings

```typescript
import { embed } from '@george-ai/llm-client'

const result = await embed({
  modelProvider: 'openai', // or 'ollama'
  modelName: 'text-embedding-3-small',
  input: ['Text 1', 'Text 2'],
  connection: {
    providerBaseUrl: 'https://api.openai.com/v1',
    providerApiKey: process.env.OPENAI_API_KEY!,
  },
})

console.log('Embeddings:', result.embeddings)
console.log('Usage:', result.usage)
```

## Types

### ChatCompletionStreamChunk

The unified streaming chunk format returned by both providers:

```typescript
interface ChatCompletionStreamChunk {
  chunk: string // Content from this chunk
  metadata?: {
    tokensProcessed?: number // Total tokens (prompt + completion)
    instanceUrl?: string // Which instance processed this
    promptTokens?: number // Input tokens
    completionTokens?: number // Output tokens
  }
}
```

### Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[] // Base64 encoded images (for vision models)
}
```

## Configuration

Copy `.env.example` to `.env` and configure your provider credentials:

```bash
cp .env.example .env
```

See `.env.example` for all available configuration options.

## Testing

```bash
# Run tests (integration tests skip automatically if env vars not set)
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

**Note**: OpenAI chat streaming tests use the hard-coded `gpt-4o-mini` model (OpenAI's cheapest model) to minimize testing costs. You only need to set `OPENAI_API_KEY` in your `.env` file to run these tests.

## Architecture

- **Provider Abstraction**: Each provider (Ollama, OpenAI) has its own internal schema and API
- **Unified Interface**: The `chat()` and `embed()` functions provide a provider-agnostic interface
- **Transform Streams**: Provider-specific chunks are transformed into the common `ChatCompletionStreamChunk` format
- **Token Mapping**:
  - Ollama: `prompt_eval_count` → `promptTokens`, `eval_count` → `completionTokens`
  - OpenAI: `usage.prompt_tokens` → `promptTokens`, `usage.completion_tokens` → `completionTokens`

## OpenAI Streaming Implementation

The OpenAI implementation follows the official [Server-Sent Events (SSE) format](https://platform.openai.com/docs/api-reference/streaming):

- Parses `data:` prefixed lines
- Handles `data: [DONE]` completion marker
- Supports `stream_options: { include_usage: true }` for token usage in the final chunk
- Handles `delta.reasoning_content` for reasoning models (e.g., o1)

## Related Packages

- `@george-ai/ai-service-client` - Multi-instance Ollama load balancer with GPU-aware routing
- `@george-ai/langchain-chat` - Higher-level LangChain integration

## License

See [LICENSE](../../LICENSE) in repository root.
