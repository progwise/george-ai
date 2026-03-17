import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { ExtractionMethod } from '@george-ai/app-schema'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

const response = builder
  .objectRef<{
    workspaceId: string
    documentId: string
    libraryId: string
    take: number
    firstChunk?: number
    extractionMethod?: ExtractionMethod | null
    fragment?: number | null
    totalCount: number | null
  }>('DocumentChunksResponse')
  .implement({
    fields: (t) => ({
      totalCount: t.exposeInt('totalCount', { nullable: true }),
      chunks: t.field({
        type: ['DocumentChunk'],
        nullable: false,
        resolve: async (root) => {
          const { workspaceId, libraryId, documentId, extractionMethod, fragment, take = 10, firstChunk = 0 } = root
          const chunks = await vectorStore.getChunks({
            workspaceId,
            libraryId,
            documentId,
            extractionMethod,
            take,
            firstChunk,
            fragment,
          })
          return chunks
        },
      }),
    }),
  })

builder.queryField('documentChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: response,
    nullable: true,
    args: {
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true }),
      take: t.arg.int({ required: false }),
      firstChunk: t.arg.int({ required: false }),
      extractionMethod: t.arg({
        type: 'ExtractionMethod',
        required: false,
      }),
      fragment: t.arg.int({ required: false }),
    },
    resolve: async (
      _root,
      { libraryId, documentId, take, firstChunk, fragment, extractionMethod },
      { workspaceId, session },
    ) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      logger.debug('getting document chunks', {
        workspaceId,
        libraryId,
        documentId,
        extractionMethod,
        fragment,
        take,
        firstChunk,
      })
      const totalCount = await vectorStore.getChunkCount({
        workspaceId,
        libraryId,
        documentId,
        extractionMethod,
        fragment,
      })
      return {
        workspaceId,
        documentId,
        libraryId,
        take: take ?? 10,
        firstChunk: firstChunk ?? 0,
        extractionMethod,
        fragment,
        totalCount,
      }
    },
  }),
)
