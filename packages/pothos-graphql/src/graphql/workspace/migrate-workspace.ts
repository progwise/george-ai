import { GraphQLError } from 'graphql'

import { canReadWorkspaceOrThrow, canWriteWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.mutationField('migrateWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { id }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      await canWriteWorkspaceOrThrow(id, session.user.id)

      try {
        const result = await workspace.migrateWorkspace({ workspaceId: id })

        return result
      } catch (error) {
        console.error('Error elevating workspace from legacy', { workspaceId: id, error })
        throw new GraphQLError('Failed to elevate workspace from legacy', { originalError: error as Error })
      }
    },
  }),
)
