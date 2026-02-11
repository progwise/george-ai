import { GraphQLError } from 'graphql/error/GraphQLError'

import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import workspaceProcessing from '@george-ai/event-service-client/src/workspace-processing'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('stopProcessing', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('StopEventProcessingResult', {
      fields: (t) => ({
        success: t.boolean(),
      }),
    }),
    nullable: false,
    args: {
      requestType: t.arg({ type: 'ProcessingRequestType', required: true }),
    },
    resolve: async (_parent, { requestType }, { workspaceId, session }) => {
      logger.debug('Stopping processing', { workspaceId, requestType })
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        await workspaceProcessing.stopProcessing({ workspaceId, requestTypes: [requestType] })
        return { success: true }
      } catch (error) {
        logger.error('Error stopping processing', { error, workspaceId, requestType })
        throw new GraphQLError('Failed to stop processing', { originalError: error as Error })
      }
    },
  }),
)
