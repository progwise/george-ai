import { GraphQLError } from 'graphql'

import { PROCESSING_REQUEST_TYPES } from '@george-ai/app-commons'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from './../../common'

builder.queryField('processingStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [
      builder.simpleObject('EventProcessingStatusResult', {
        fields: (t) => ({
          status: t.field({ type: 'EventProcessingStatus', nullable: false }),
          requestType: t.field({ type: 'ProcessingRequestType', nullable: false }),
        }),
      }),
    ],
    nullable: false,
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const status = await Promise.all(
          PROCESSING_REQUEST_TYPES.map(async (requestType) => {
            const status = await workspaceProcessing.processingStatus({ workspaceId, requestType })
            return { status, requestType }
          }),
        )
        return status
      } catch (error) {
        logger.error('Error fetching processing status', { error, workspaceId })
        throw new GraphQLError('Failed to fetch processing status', { originalError: error as Error })
      }
    },
  }),
)
