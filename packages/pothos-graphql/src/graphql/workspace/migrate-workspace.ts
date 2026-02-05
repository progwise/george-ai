import { GraphQLError } from 'graphql'

import { canAdminWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.mutationField('migrateWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {},
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const result = await workspace.migrateWorkspace({ workspaceId })

        return result
      } catch (error) {
        console.error('Error elevating workspace from legacy', { workspaceId, error })
        throw new GraphQLError('Failed to elevate workspace from legacy', { originalError: error as Error })
      }
    },
  }),
)
