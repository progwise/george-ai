import { canReadWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.queryField('workspaceNeedsMigration', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('WorkspaceNeedsMigration', {
      description: 'Indicates whether a workspace needs migration',
      fields: (f) => ({
        needsMigration: f.boolean({ description: 'Whether the workspace needs migration' }),
        id: f.id({ description: 'The ID of the workspace' }),
        name: f.string({ description: 'The name of the workspace' }),
        hasWorkspaceStorage: f.boolean({ description: 'Whether the workspace has workspace storage' }),
        hasVectorStore: f.boolean({ description: 'Whether the workspace has a vector store' }),
      }),
    }),
    nullable: true,
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const result = await workspace.workspaceNeedsMigration({
        workspaceId: workspaceId,
      })

      return result
    },
  }),
)
