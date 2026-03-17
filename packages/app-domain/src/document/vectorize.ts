import { Readable } from 'stream'

import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'
import { invokeAction } from '@george-ai/event-service-client'
import { getDocumentOrThrow, readExtraction } from '@george-ai/file-management'
import { splitMarkdownStream } from '@george-ai/markdown-splitter'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from '../common'

export async function vectorizeDocument(parameters: {
  documentId: string
  libraryId: string
  workspaceId: string
  extractionMethod: ExtractionMethod
  embeddingDriver: InferenceDriver
  embeddingModel: string
}) {
  const { documentId, libraryId, workspaceId, extractionMethod, embeddingDriver, embeddingModel } = parameters

  const document = await getDocumentOrThrow({
    workspaceId,
    libraryId,
    documentId,
  })

  const extractionReader = await readExtraction({
    workspaceId,
    libraryId,
    documentId,
    extractionMethod,
    version: 1,
    type: 'extraction',
  })

  const chunkWriter = splitMarkdownStream({
    splitType: 'standard',
    markdownStream: Readable.from(extractionReader.stream),
    options: { maxCharsPerSection: 1000, splitSectionOverlapLines: 2 },
  })

  let i = 0
  for await (const chunk of chunkWriter) {
    i++
    const embeddings = await invokeAction({
      workspaceId,
      version: 1,
      verb: 'request',
      action: 'chunkEmbedding',
      timestamp: new Date(),
      driver: embeddingDriver,
      modelName: embeddingModel,
      chunks: [chunk],
    }).catch((error) => {
      logger.error('Error generating embeddings', {
        workspaceId,
        embeddingModel,
        embeddingDriver,
        documentId,
        libraryId,
        chunkIndex: i,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    })
    await vectorStore
      .upsertChunks({
        workspaceId,
        chunks: [
          {
            documentId,
            documentName: document.name,
            documentHash: document.sourceHash || undefined,
            documentPath: document.origin.uri,
            creationAuthor: document.origin.author,
            documentCreatedAt: document.origin.creationDate?.toISOString(),
            documentMimeType: document.mimeType,
            documentUpdatedAt: document.origin.lastModifiedDate?.toISOString(),
            documentUploadedAt: document.created?.toISOString(),
            libraryId,
            content: chunk,
            extractionMethod: 'csvExtraction',
            chunk: i,
            id: `${documentId}-chunk-${i}`,

            embedding: embeddings
              ? {
                  embeddingModelName: embeddingModel,
                  vector: embeddings.embeddings[0].vector,
                }
              : undefined,
          },
        ],
      })
      .catch((error) => {
        logger.error('Error upserting chunk to vector store', {
          documentId,
          libraryId,
          chunkIndex: i,
          error,
        })
      })
  }

  logger.info('Chunks stored in vector store', {
    documentId,
    libraryId,
    chunkCount: i,
  })
}
