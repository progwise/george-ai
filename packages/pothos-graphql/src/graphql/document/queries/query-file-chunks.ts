import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { DocumentChunk, vectorStore } from '@george-ai/vector-store'

import { builder } from '../../builder'

builder.queryField('queryFileChunks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.objectRef<{ hitCount: number; chunks: Array<DocumentChunk> }>('DocumentChunksQueryResult').implement({
      fields: (t) => ({
        hitCount: t.exposeInt('hitCount', { nullable: false }),
        results: t.expose('chunks', { type: ['DocumentChunk'], nullable: false }),
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

      const result = await vectorStore.queryChunks({
        workspaceId,
        selector,
        skip: skip || 0,
        take: take || 20,
      })

      return result
    },
  }),
)
