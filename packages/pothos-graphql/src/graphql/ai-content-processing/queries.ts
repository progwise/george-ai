import { GraphQLError } from 'graphql'

import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../builder'
import { canReadWorkspaceOrThrow } from '../workspace'
import { logger } from './common'

builder.queryField('eventProcessingStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [
      builder.simpleObject('EventProcessingStatusResult', {
        fields: (t) => ({
          status: t.field({ type: 'EventProcessingStatus', nullable: false }),
          actionType: t.field({ type: 'ActionType', nullable: false }),
        }),
      }),
    ],
    nullable: false,
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const status = await Promise.all(
          workspaceProcessing.ACTION_TYPES.map(async (actionType) => {
            const status = await workspaceProcessing.processingStatus({ workspaceId, actionType })
            return { status, actionType }
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
