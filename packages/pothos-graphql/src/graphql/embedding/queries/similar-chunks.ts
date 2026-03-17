import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceDriverSchema } from '@george-ai/app-schema'
import { invokeAction } from '@george-ai/event-service-client'
import { EmbeddingRequest } from '@george-ai/event-service-client'
import { DocumentChunk, vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

const result = builder
  .objectRef<
    DocumentChunk & {
      distance: number
    }
  >('SimilarChunkResult')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      libraryId: t.exposeString('libraryId', { nullable: false }),
      documentId: t.exposeString('documentId', { nullable: false }),
      documentName: t.exposeString('documentName', { nullable: true }),
      extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
      chunk: t.exposeInt('chunk', { nullable: false }),
      fragment: t.exposeInt('fragment', { nullable: true }),
      embeddingModelNames: t.exposeStringList('embeddingModelNames', { nullable: true }),
      content: t.exposeString('content', { nullable: true }),
      dispatchEvent: t.exposeFloat('distance', { nullable: false }),
      distance: t.exposeFloat('distance', { nullable: false }),
    }),
  })

builder.queryField('similarChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [result],
    nullable: { items: false, list: false },
    args: {
      libraryId: t.arg.string({ required: false }),
      documentId: t.arg.string({ required: false }),
      term: t.arg.string({ required: false }),
      maxResults: t.arg.int({ required: false, defaultValue: 20 }),
      fragment: t.arg.int({ required: false }),
    },
    resolve: async (_source, { libraryId, documentId, term, maxResults, fragment }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      if (!term || term.length === 0) {
        return []
      }

      logger.debug('Finding similar chunks', {
        workspaceId,
        libraryId,
        documentId,
        termLength: term.length,
        maxResults,
        fragment,
      })

      const libraries = await prisma.aiLibrary.findMany({
        where: { workspaceId, ...(libraryId ? { id: libraryId } : {}) },
        select: { id: true, embeddingModel: { select: { provider: true, name: true } } },
      })

      const embeddingResults = await Promise.all(
        libraries.map(async (library) => {
          if (!library.embeddingModel) {
            logger.error('Library does not have an embedding model configured', {
              workspaceId,
              libraryId: library.id,
            })
            return null
          }

          const driver = InferenceDriverSchema.parse(library.embeddingModel.provider)
          const modelName = library.embeddingModel.name

          const request: EmbeddingRequest = {
            version: 1,
            workspaceId,
            verb: 'request',
            action: 'chunkEmbedding',
            timestamp: new Date(),
            driver,
            modelName,
            chunks: [term],
          }

          const embeddingResult = await invokeAction(request)

          if (embeddingResult.embeddings.length < 1) {
            logger.error('No embeddings returned from invoke', { request })
          }

          const vector = embeddingResult.embeddings[0].vector

          const results = await vectorStore.findSimilarChunks({
            workspaceId,
            libraryId,
            documentId,
            vector,
            topK: maxResults || 10,
            fragment: fragment ?? null,
            modelName,
          })

          return results.map((result) => ({ ...result, distance: result.distance }))
        }),
      )

      return embeddingResults.filter((res): res is NonNullable<typeof res> => res !== null).flat()
    },
  }),
)
