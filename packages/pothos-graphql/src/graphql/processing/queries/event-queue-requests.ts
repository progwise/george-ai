import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { viewStreamedRequests } from '@george-ai/event-service-client'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.queryField('eventQueueRequests', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.objectRef<Awaited<ReturnType<typeof viewStreamedRequests>>>('EventQueueRequestsResult').implement({
      description: 'take and sequence based',
      fields: (t) => ({
        totalMessages: t.exposeInt('totalMessages', { nullable: false }),
        lastSequence: t.exposeInt('lastSequence', { nullable: false }),
        requests: t.expose('requests', { type: ['EventQueueRequest'], nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      workspaceId: t.arg.string(),
      action: t.arg({ type: 'EventQueueAction', required: false }),
      startSequence: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (_parent, { workspaceId, action, startSequence, take }, { session }) => {
      canReadWorkspaceOrThrow(workspaceId, session.user.id)

      logger.debug('Resolving eventQueueRequests with parameters', { workspaceId, action, startSequence, take })

      const result = await viewStreamedRequests({
        workspaceId,
        action: action || undefined,
        startSequence: startSequence || undefined,
        take: take || undefined,
      })
      return result
    },
  }),
)
