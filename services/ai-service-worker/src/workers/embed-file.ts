import { pipeline } from 'node:stream/promises'

import { getChunkVectors } from '@george-ai/ai-service-client'

import '@george-ai/event-service-client'

import { WorkspaceFileEmbeddingRequestEvent } from '@george-ai/event-service-client/src/workspace-stream/schema'
import { workspaceStorage } from '@george-ai/file-management/src/storage'
import { vectorStore } from '@george-ai/vector-store-client'

import { WORKER_ID } from '../constants'
import { getWorkspaceEntry } from '../workspaces'

const CHUNK_BATCH_SIZE = 20

export async function embedFile(event: WorkspaceFileEmbeddingRequestEvent) {
  const { workspaceId, libraryId, fileId, markdownFilename, embeddingModelName, embeddingModelProvider } = event

  const result = {
    chunkCount: 0,
    chunkSize: 0,
    tokensUsed: 0,
    startTime: Date.now(),
    processingTimeMs: 0,
  }

  const workspaceEntry = getWorkspaceEntry(workspaceId)

  if (!workspaceEntry) {
    const message = `No cached workspace found with ID ${workspaceId} for embedding request`
    console.warn(message)
    return { ...result, processingTimeMs: Date.now() - result.startTime, success: false, message }
  }

  const provider = workspaceEntry.languageModels?.find(
    (model) => model.name === embeddingModelName && model.provider === embeddingModelProvider,
  )
  if (!provider) {
    const message = `No provider found for model ${embeddingModelName} and provider ${embeddingModelProvider} in workspace ${workspaceId}`
    console.warn(message)
    return { ...result, processingTimeMs: Date.now() - result.startTime, success: false, message }
  }

  const fileSourceStream = await workspaceStorage.readSource(workspaceId, libraryId, fileId) //loadSourceFile({ workspaceId, fileId, markdownFilename })

  try {
    console.log(`[Processing file ${fileId} (${markdownFilename}) with ${provider.id}`)

    await pipeline(
      fileSourceStream,
      markdownSplitter(() => (result.chunkCount = result.chunkCount + 1)),
      vectorGenerator(
        workspaceId,
        embeddingModelProvider,
        embeddingModelName,
        (tokens) => (result.tokensUsed += tokens),
      ),
      storeEmbeddings(workspaceId, libraryId, fileId, embeddingModelName, (bytes) => (result.chunkSize += bytes)),
    )
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error)
    throw error
  }

  const message = `Successfully embedded ${result.chunkCount} chunks for file ${fileId} using model ${embeddingModelName}`
  console.log(message)
  return {
    chunkCount: result.chunkCount,
    chunkSize: result.chunkSize,
    tokensUsed: result.tokensUsed,
    processingTimeMs: Date.now() - result.startTime,
    success: true,
    message,
  }
}

const markdownSplitter = (increaseChunkCount: () => void) =>
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
          increaseChunkCount()
        }
        buffer = buffer.slice(boundary + 2)
        boundary = buffer.lastIndexOf('\n\n')
      }
    }
    const remaining = buffer.trim()
    if (remaining.length > 0) {
      yield { index: chunkIndex++, text: remaining, length: remaining.length }
      increaseChunkCount()
    }
  }

const vectorGenerator = (
  workspaceId: string,
  provider: string,
  modelName: string,
  increaseTokensUsed: (tokens: number) => void,
) =>
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
        increaseTokensUsed(embedding.usage.totalTokens)
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
      increaseTokensUsed(embedding.usage.totalTokens)
    }
  }

const storeEmbeddings = (
  workspaceId: string,
  libraryId: string,
  fileId: string,
  modelName: string,
  increaseBytesUsed: (bytes: number) => void,
) =>
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
      increaseBytesUsed(batch.reduce((sum, item) => sum + Buffer.byteLength(item.text, 'utf-8'), 0))
    }
  }
