import { GraphQLError } from 'graphql/error'

import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('workspaceProcessStatistics', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['WorkspaceProcessStatistics'],
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const statistics = await workspaceProcessing.getWorkspaceStatistics(workspaceId)
        return statistics
      } catch (error) {
        logger.error('Error fetching workspace process statistics', { error, workspaceId })
        throw new GraphQLError(`Failed to fetch workspace process statistics: ${(error as Error).message}`)
      }
    },
  }),
)
