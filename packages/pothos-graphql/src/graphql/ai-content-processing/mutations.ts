import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { canWriteWorkspaceOrThrow } from '../workspace'

builder.mutationField('triggerEmbedding', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('TriggerEmbeddingResult', {
      fields: (t) => ({
        success: t.boolean({ nullable: false }),
      }),
    }),
    nullable: false,
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      await workspace.startProcessing(workspaceId, 'embedding')
      return { success: true }
    },
  }),
)
