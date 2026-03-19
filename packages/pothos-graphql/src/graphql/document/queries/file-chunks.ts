import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { ExtractionMethod, InferenceDriver } from '@george-ai/app-schema'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

const response = builder
  .objectRef<{
    workspaceId: string
    modelDriver: InferenceDriver
    modelName: string
    documentId: string
    libraryId: string
    take: number
    firstChunk?: number
    extractionMethod?: ExtractionMethod | null
    fragment?: number | null
    totalCount: number | null
  }>('VectorStoreChunkResponse')
  .implement({
    fields: (t) => ({
      totalCount: t.exposeInt('totalCount', { nullable: true }),
      chunks: t.field({
        type: ['VectorStoreChunk'],
        nullable: false,
        resolve: async (root) => {
          const {
            workspaceId,
            modelDriver,
            modelName,
            libraryId,
            documentId,
            extractionMethod,
            fragment,
            take = 10,
            firstChunk = 0,
          } = root

          const chunks = await vectorStore.getChunks({
            workspaceId,
            modelDriver,
            modelName,
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
      const workspaceSettings = await getWorkspaceSettings(workspaceId)
      const embedding = workspaceSettings?.embedding
      if (!embedding || !embedding.modelDriver || !embedding.modelName) {
        throw new Error('Workspace Manifest not found for workspaceId: ' + workspaceId)
      }
      logger.debug('getting document chunks', {
        workspaceId,
        workspaceSettings,
        libraryId,
        documentId,
        extractionMethod,
        fragment,
        take,
        firstChunk,
      })
      const totalCount = await vectorStore.getChunkCount({
        workspaceId,
        modelDriver: embedding.modelDriver,
        modelName: embedding.modelName,
        libraryId,
        documentId,
        extractionMethod,
        fragment,
      })
      return {
        workspaceId,
        modelDriver: embedding.modelDriver,
        modelName: embedding.modelName,
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
