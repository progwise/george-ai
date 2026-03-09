import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { pauseEventProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('stopProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['EventQueue'],
    nullable: false,
    args: {
      action: t.arg({ type: 'EventQueueAction' }),
    },
    resolve: async (_parent, { action }, { workspaceId, session }) => {
      logger.debug('Stop processing', { workspaceId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const result = await pauseEventProcessing({ workspaceId, action })
        return result
      } catch (error) {
        logger.error('Error stopp processing', { error, workspaceId })
        throw new GraphQLError('Failed to stopp processing', { originalError: error as Error })
      }
    },
  }),
)
