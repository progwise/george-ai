import { GraphQLError } from 'graphql'

import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { canReadWorkspaceOrThrow } from '../workspace'
import { logger } from './common'

builder.queryField('eventProcessingStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [
      builder.simpleObject('EventProcessingStatusResult', {
        fields: (t) => ({
          status: t.field({ type: 'EventProcessingStatus', nullable: false }),
          processType: t.field({ type: 'ProcessType', nullable: false }),
        }),
      }),
    ],
    nullable: false,
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        const status = await workspace.getProcessingStatus(workspaceId)
        return status
      } catch (error) {
        logger.error('Error fetching processing status', { error, workspaceId })
        throw new GraphQLError('Failed to fetch processing status', { originalError: error as Error })
      }
    },
  }),
)
