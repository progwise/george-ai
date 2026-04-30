import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { VectorStoreChunk, vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('queryDocumentChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder
      .objectRef<{ message?: string; hitCount: number; chunks: Array<VectorStoreChunk> }>('DocumentChunksQueryResult')
      .implement({
        fields: (t) => ({
          message: t.exposeString('message', { nullable: true }),
          hitCount: t.exposeInt('hitCount', { nullable: false }),
          results: t.expose('chunks', { type: ['VectorStoreChunk'], nullable: false }),
        }),
      }),
    nullable: false,
    args: {
      query: t.arg.string({ required: true }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
      selector: t.arg({
        type: 'DocumentChunksSelector',
        required: true,
      }),
    },
    resolve: async (_root, { skip, take, selector }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const workspaceSettings = await getWorkspaceSettings(workspaceId)
      const embedding = workspaceSettings?.embedding
      if (!embedding || !embedding.modelDriver || !embedding.modelName) {
        logger.warn('Cannot query document chunks because embedding is not configured for workspace', { workspaceId })
        return {
          message: 'Embedding is not configured for this workspace',
          hitCount: 0,
          chunks: [],
        }
      }
      const result = await vectorStore.queryChunks({
        workspaceId,
        modelDriver: embedding.modelDriver,
        modelName: embedding.modelName,
        selector,
        skip: skip || 0,
        take: take || 20,
      })

      return result
    },
  }),
)
