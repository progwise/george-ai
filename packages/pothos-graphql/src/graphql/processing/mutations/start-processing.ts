import { GraphQLError } from 'graphql'

import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('startProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('StartProcessingResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: true }),
    },
    nullable: false,
    resolve: async (_parent, { requestType }, { workspaceId, session }) => {
      logger.debug('Starting processing', { workspaceId, requestType })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.startProcessing({ workspaceId, requestTypes: [requestType] })
        return { success: true }
      } catch (error) {
        logger.error('Error starting processing', { error, workspaceId, requestType })
        throw new GraphQLError('Failed to start processing', { originalError: error as Error })
      }
    },
  }),
)
