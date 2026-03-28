import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getWorkspaceSettings } from '@george-ai/file-management/src/workspace-storage/workspace/get-workspace'
import { VectorStoreChunk, vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'

builder.queryField('queryDocumentChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder
      .objectRef<{ hitCount: number; chunks: Array<VectorStoreChunk> }>('DocumentChunksQueryResult')
      .implement({
        fields: (t) => ({
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
        throw new Error('Workspace Manifest not found for workspaceId: ' + workspaceId)
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
