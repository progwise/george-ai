import type { EmbeddingRequestEvent } from '@george-ai/events'

import { getProviderForModel } from '../provider-cache'
import { LocalSemaphore } from '../semaphore'

// Semaphore to limit concurrent requests per provider
// TODO: Configure max concurrent requests per provider type
const semaphore = new LocalSemaphore(
  new Map([
    ['ollama', 3], // Max 3 concurrent Ollama requests
    ['openai', 10], // Max 10 concurrent OpenAI requests
    ['anthropic', 5], // Max 5 concurrent Anthropic requests
  ]),
)

export async function handleEmbeddingRequest(event: EmbeddingRequestEvent): Promise<void> {
  const { workspaceId, fileId, markdownFilename, fileEmbeddingOptions, processingTaskId } = event

  // 1. Get provider for the requested model
  const provider = getProviderForModel(fileEmbeddingOptions.embeddingModelName, workspaceId)

  if (!provider) {
    throw new Error(
      `No provider found for model ${fileEmbeddingOptions.embeddingModelName} in workspace ${workspaceId}`,
    )
  }

  console.log(
    `Using provider: ${provider.providerType} (${provider.baseUrl}) for model ${fileEmbeddingOptions.embeddingModelName}`,
  )

  // 2. Acquire semaphore for this provider type
  const release = await semaphore.acquire(provider.providerType)

  try {
    // TODO: Implement actual embedding generation
    // This requires:
    // 1. Read markdown file from storage
    // 2. Chunk markdown into semantic chunks
    // 3. Generate embeddings for each chunk using the provider
    // 4. Store embeddings in vector store (Typesense)
    // 5. Track progress and publish progress events

    console.log(`[${processingTaskId}] Processing file ${fileId} (${markdownFilename}) with ${provider.providerType}`)

    // Placeholder implementation
    await new Promise((resolve) => setTimeout(resolve, 100))

    console.log(`[${processingTaskId}] Successfully processed file ${fileId}`)

    // TODO: Publish completion event
    // await workspace.publishEmbeddingFinished(eventClient, {
    //   eventName: 'file-embedding-finished',
    //   workspaceId,
    //   fileId,
    //   processingTaskId,
    //   fileEmbeddingResult: {
    //     chunkCount: chunks.length,
    //     processingTimeMs: duration,
    //     success: true,
    //     ...
    //   },
    //   ...
    // })
  } finally {
    release()
  }
}
