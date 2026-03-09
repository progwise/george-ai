import { GraphQLError } from 'graphql'

import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { resumeEventProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('startProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['EventQueue'],
    nullable: false,
    args: {
      action: t.arg({ type: 'EventQueueAction' }),
    },
    resolve: async (_parent, { action }, { workspaceId, session }) => {
      logger.debug('Starting processing', { workspaceId })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const result = await resumeEventProcessing({ workspaceId, action })
        return result
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId })
        throw new GraphQLError('Failed to start processing', { originalError: error as Error })
      }
    },
  }),
)
