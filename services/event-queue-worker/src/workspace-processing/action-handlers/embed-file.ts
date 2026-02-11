import { pipeline } from 'node:stream/promises'

import { type EmbedFileRequest, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'
import { vectorStore } from '@george-ai/vector-store'

import { WORKER_ID, logger } from '../../common'

export async function embedFile(event: EmbedFileRequest) {
  const { workspaceId, libraryId, fileId, embeddingModelProvider, embeddingModelName, extractionMethod } = event

  const result = {
    chunkCount: 0,
    chunkSize: 0,
    tokensUsed: 0,
    startTime: Date.now(),
    processingTimeMs: 0,
  }

  const chunkStream = vectorStore.readChunks({ workspaceId, libraryId, fileId, extractionMethod })

  try {
    logger.debug('Processing file embedding', {
      fileId,
      workspaceId,
      embeddingModelName,
      embeddingModelProvider,
      workerId: WORKER_ID,
    })

    // Split into three main steps:
    // Extraction = create markdown from any source
    // Chunking = create meaningful chunks from markdown
    // Embedding = generate vectors for chunks

    await pipeline(chunkStream, async (source) => {
      for await (const chunks of source) {
        const filteredChunks = chunks
          .filter((chunk) => !!chunk.content && chunk.content.length > 0)
          .map((chunk) => ({
            workspaceId,
            libraryId,
            fileId,
            fragment: chunk.fragment,
            extractionMethod,
            chunkIndex: chunk.chunk,
            content: chunk.content!,
          }))
        await modelCalls.publishProviderCallEvent({
          version: 1,
          modelCallType: 'generateEmbedding',
          provider: embeddingModelProvider,
          modelName: embeddingModelName,
          inputTexts: filteredChunks.map((chunk) => chunk.content!),
          workspaceId,
          replySubject: workspaceProcessing.getReplySubject(event),
          context: { chunks: filteredChunks },
        })
      }
    })
  } catch (error) {
    const message = `Error embedding for file ${fileId}, model ${embeddingModelName}, provider ${embeddingModelProvider}, workspace ${workspaceId}: \n${error instanceof Error ? error.message : 'Unknown error'}`
    logger.error('Error processing file embedding', {
      fileId,
      workspaceId,
      embeddingModelName,
      embeddingModelProvider,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { ...result, processingTimeMs: Date.now() - result.startTime, success: false, message }
  }

  const message = `Successfully embedded ${result.chunkCount} chunks for file ${fileId} using model ${embeddingModelName}`
  logger.debug('Successfully embedded file', {
    fileId,
    workspaceId,
    embeddingModelName,
    chunkCount: result.chunkCount,
    tokensUsed: result.tokensUsed,
    processingTimeMs: Date.now() - result.startTime,
  })
  return {
    chunkCount: result.chunkCount,
    chunkSize: result.chunkSize,
    tokensUsed: result.tokensUsed,
    processingTimeMs: Date.now() - result.startTime,
    success: true,
    message,
  }
}

// const markdownSplitter = (increaseChunkCount: () => void) =>
//   async function* (source: AsyncIterable<Buffer>) {
//     let chunkIndex = 0
//     const MAX_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
//     let buffer = ''
//     for await (const chunk of source) {
//       buffer += chunk.toString('utf-8')
//       if (buffer.length > MAX_CHUNK_SIZE) {
//         // Force split at MAX_CHUNK_SIZE
//         const segment = buffer.slice(0, MAX_CHUNK_SIZE)
//         yield { index: chunkIndex++, text: segment, length: segment.length }
//         increaseChunkCount()
//         buffer = buffer.slice(MAX_CHUNK_SIZE)
//       }
//       let boundary = buffer.lastIndexOf('\n\n')
//       while (boundary !== -1) {
//         const segment = buffer.slice(0, boundary).trim()
//         if (segment.length > 0) {
//           yield { index: chunkIndex++, text: segment, length: segment.length }
//           increaseChunkCount()
//         }
//         buffer = buffer.slice(boundary + 2)
//         boundary = buffer.lastIndexOf('\n\n')
//       }
//     }
//     const remaining = buffer.trim()
//     if (remaining.length > 0) {
//       yield { index: chunkIndex++, text: remaining, length: remaining.length }
//       increaseChunkCount()
//     }
//   }

// const callVectorGenerator = (
//   workspaceId: string,
//   provider: Provider,
//   modelName: string,
//   increaseTokensUsed: (tokens: number) => void,
// ) =>
//   async function* (chunks: AsyncIterable<{ index: number; text: string; length: number }>) {
//     let currentBatch: { index: number; text: string; length: number }[] = []
//     for await (const chunk of chunks) {
//       currentBatch.push(chunk)
//       if (currentBatch.length >= CHUNK_BATCH_SIZE) {
//         const { responseSubject } = await providerCalls.publishProviderCallEvent({
//           version: 1,
//           serviceCallType: 'generateEmbedding',
//           provider,
//           modelName,
//           inputTexts: currentBatch.map((c) => c.text),
//           workspaceId,
//           timestamp: new Date().toISOString(),
//         })
//         const embedding = await getChunkVectors(
//           workspaceId,
//           provider,
//           modelName,
//           currentBatch.map((c) => c.text),
//         )
//         yield currentBatch.map((chunk, index) => ({
//           ...chunk,
//           embedding: embedding.embeddings[index],
//         }))
//         increaseTokensUsed(embedding.usage.totalTokens)
//         currentBatch = []
//       }
//     }
//     if (currentBatch.length > 0) {
//       const embedding = await getChunkVectors(
//         workspaceId,
//         provider,
//         modelName,
//         currentBatch.map((c) => c.text),
//       )
//       yield currentBatch.map((chunk, index) => ({
//         ...chunk,
//         embedding: embedding.embeddings[index],
//       }))
//       increaseTokensUsed(embedding.usage.totalTokens)
//     }
//   }

// const storeEmbeddings = (
//   workspaceId: string,
//   libraryId: string,
//   fileId: string,
//   modelName: string,
//   increaseBytesUsed: (bytes: number) => void,
// ) =>
//   async function* <T extends { index: number; text: string; embedding: number[] }>(batches: AsyncIterable<T[]>) {
//     let vectorStoreInitialized = false
//     for await (const batch of batches) {
//       if (!vectorStoreInitialized) {
//         await vectorStoreClient.ensureWorkspace(workspaceId)
//         vectorStoreInitialized = true
//       }
//       logger.info('Storing embeddings batch', {
//         workerId: WORKER_ID,
//         batchSize: batch.length,
//         fileId,
//       })
//       await vectorStoreClient.upsertDocuments(
//         workspaceId,
//         batch.map((item) => ({
//           id: `file_${fileId}_chunk_${item.index}`,
//           vectors: { [modelName]: item.embedding },
//           payload: {
//             workspaceId,
//             chunkIndex: item.index,
//             shardIndex: null,
//             status: 'completed',
//             text: item.text,
//             fileId,
//             libraryId,
//             updatedAt: new Date().toISOString(),
//           },
//         })),
//       )
//       yield batch
//       increaseBytesUsed(batch.reduce((sum, item) => sum + Buffer.byteLength(item.text, 'utf-8'), 0))
//     }
//   }
