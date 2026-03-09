import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { eventProcessingStatus } from '@george-ai/event-service-client/src/action/consumer'

import { builder } from '../../builder'

builder.queryField('eventQueueStats', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['EventQueue'],
    nullable: false,
    args: {
      workspaceId: t.arg.string(),
    },
    resolve: async (_parent, { workspaceId }, { session }) => {
      canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const result = await eventProcessingStatus({ workspaceId })
      return result
    },
  }),
)
