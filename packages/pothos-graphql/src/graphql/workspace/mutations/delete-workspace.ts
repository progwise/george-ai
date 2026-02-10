import { doesOwnWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('deleteWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {},
    resolve: async (_root, _args, { workspaceId, session }) => {
      doesOwnWorkspaceOrThrow(workspaceId, session.user.id)

      await workspace.deleteWorkspace(workspaceId)

      return true
    },
  }),
)
