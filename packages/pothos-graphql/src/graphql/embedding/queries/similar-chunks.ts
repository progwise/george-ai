import { GraphQLError } from 'graphql/error'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { providerHealth } from '@george-ai/event-service-client'
import { modelCalls } from '@george-ai/event-service-client'
import { FileChunk, vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

const result = builder
  .objectRef<
    FileChunk & {
      distance: number
    }
  >('SimilarChunkResult')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      libraryId: t.exposeString('libraryId', { nullable: false }),
      fileId: t.exposeString('fileId', { nullable: false }),
      filename: t.exposeString('filename', { nullable: true }),
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
      fileId: t.arg.string({ required: false }),
      term: t.arg.string({ required: false }),
      maxResults: t.arg.int({ required: false, defaultValue: 20 }),
      fragment: t.arg.int({ required: false }),
      modelProvider: t.arg({
        type: 'ModelProvider',
        required: true,
      }),
      modelName: t.arg.string({ required: true }),
    },
    resolve: async (
      _source,
      { libraryId, fileId, term, maxResults, fragment, modelProvider, modelName },
      { workspaceId, session },
    ) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      if (!term || term.length === 0) {
        return []
      }

      logger.debug('Finding similar chunks', {
        workspaceId,
        libraryId,
        fileId,
        termLength: term.length,
        maxResults,
        fragment,
        modelProvider,
        modelName,
      })
      const healthyProviderData = await providerHealth.getProviderInstanceForDirectCall({
        workspaceId,
        provider: modelProvider,
        modelName,
      })
      if (!healthyProviderData) {
        logger.error('No provider instance available for similarChunks query', {
          workspaceId,
          modelProvider,
          modelName,
        })
        throw new GraphQLError('No provider instance available')
      }
      const embeddingResult = await modelCalls.directModelCall({
        version: 1,
        modelCallType: 'generateEmbedding',
        provider: modelProvider,
        modelName,
        inputTexts: [term],
        workspaceId,
      })

      const results = await vectorStore.findSimilarChunks({
        workspaceId,
        libraryId,
        fileId,
        vector: embeddingResult.embeddings[0],
        topK: maxResults || 10,
        fragment: fragment ?? null,
        modelName,
      })

      return results.map((result) => ({ ...result, distance: result.distance }))
    },
  }),
)
