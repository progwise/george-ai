import { pipeline } from 'node:stream/promises'

import { getChunkVectors } from '@george-ai/ai-service-client'
import { workspace } from '@george-ai/events'
import { workspaceStorage } from '@george-ai/file-management/src/storage'
import { vectorStore } from '@george-ai/vector-store-client'

import { WORKER_ID } from '../constants'
import { getProviderForModel } from '../workspace-cache'

const CHUNK_BATCH_SIZE = 20

export async function handleEmbeddingRequest(event: workspace.EmbeddingRequestEvent): Promise<void> {
  const { workspaceId, libraryId, fileId, markdownFilename, fileEmbeddingOptions, processingTaskId } = event

  const provider = getProviderForModel(fileEmbeddingOptions.embeddingModelName, workspaceId)

  if (!provider || (provider.name !== 'openai' && provider.name !== 'ollama')) {
    console.error(
      `[${processingTaskId}] No provider with openai or ollama found for model ${fileEmbeddingOptions.embeddingModelName} in workspace ${workspaceId}`,
    )
    return
  }
  const fileSourceStream = await workspaceStorage.readSource(workspaceId, libraryId, fileId) //loadSourceFile({ workspaceId, fileId, markdownFilename })

  try {
    console.log(`[${processingTaskId}] Processing file ${fileId} (${markdownFilename}) with ${provider.id}`)

    await pipeline(
      fileSourceStream,
      markdownSplitter(),
      vectorGenerator(workspaceId, provider.name, fileEmbeddingOptions.embeddingModelName),
      storeEmbeddings(workspaceId, libraryId, fileId, fileEmbeddingOptions.embeddingModelName),
    )
  } catch (error) {
    console.error(`[${processingTaskId}] Error processing file ${fileId}:`, error)
    throw error
  }

  console.log(`[${processingTaskId}] Completed processing file ${fileId}`)
}

const markdownSplitter = () =>
  async function* (source: AsyncIterable<Buffer>) {
    let chunkIndex = 0
    let buffer = ''
    for await (const chunk of source) {
      buffer += chunk.toString('utf-8')
      let boundary = buffer.lastIndexOf('\n\n')
      while (boundary !== -1) {
        const segment = buffer.slice(0, boundary).trim()
        if (segment.length > 0) {
          yield { index: chunkIndex++, text: segment, length: segment.length }
        }
        buffer = buffer.slice(boundary + 2)
        boundary = buffer.lastIndexOf('\n\n')
      }
    }
    const remaining = buffer.trim()
    if (remaining.length > 0) {
      yield { index: chunkIndex++, text: remaining, length: remaining.length }
    }
  }

const vectorGenerator = (workspaceId: string, provider: 'openai' | 'ollama', modelName: string) =>
  async function* (chunks: AsyncIterable<{ index: number; text: string; length: number }>) {
    let currentBatch: { index: number; text: string; length: number }[] = []
    for await (const chunk of chunks) {
      currentBatch.push(chunk)
      if (currentBatch.length >= CHUNK_BATCH_SIZE) {
        const embedding = await getChunkVectors(
          workspaceId,
          provider,
          modelName,
          currentBatch.map((c) => c.text),
        )
        yield currentBatch.map((chunk, index) => ({
          ...chunk,
          embedding: embedding.embeddings[index],
        }))
        currentBatch = []
      }
    }
    if (currentBatch.length > 0) {
      const embedding = await getChunkVectors(
        workspaceId,
        provider,
        modelName,
        currentBatch.map((c) => c.text),
      )
      yield currentBatch.map((chunk, index) => ({
        ...chunk,
        embedding: embedding.embeddings[index],
      }))
    }
  }

const storeEmbeddings = (workspaceId: string, libraryId: string, fileId: string, modelName: string) =>
  async function* <T extends { index: number; text: string; embedding: number[] }>(batches: AsyncIterable<T[]>) {
    let vectorStoreInitialized = false
    const collectionName = `workspace_${workspaceId}`
    for await (const batch of batches) {
      if (!vectorStoreInitialized) {
        await vectorStore.ensure(collectionName, {
          vectorModels: { [modelName]: { size: batch[0].embedding.length, distance: 'Cosine' } },
        })
        vectorStoreInitialized = true
      }
      console.log(`[${WORKER_ID}] Storing batch of ${batch.length} embeddings for file ${fileId}`)
      await vectorStore.upsert(
        `workspace_${workspaceId}`,
        batch.map((item) => ({
          id: `file_${fileId}_chunk_${item.index}`,
          vectors: { [modelName]: item.embedding },
          payload: {
            workspaceId,
            chunkIndex: item.index,
            shardIndex: null,
            status: 'completed',
            text: item.text,
            fileId,
            libraryId,
            updatedAt: new Date().toISOString(),
          },
        })),
      )
      yield batch
    }
  }
