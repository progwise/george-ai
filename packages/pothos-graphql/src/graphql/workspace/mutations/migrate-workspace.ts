import { GraphQLError } from 'graphql'

import { canAdminWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('migrateWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {},
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)
      logger.debug('Starting workspace migration from legacy', { workspaceId, userId: session.user.id })
      try {
        return await workspace.migrateWorkspace({ workspaceId })
      } catch (error) {
        logger.error('Error elevating workspace from legacy', { workspaceId, error })
        throw new GraphQLError('Failed to elevate workspace from legacy', { originalError: error as Error })
      }
    },
  }),
)
