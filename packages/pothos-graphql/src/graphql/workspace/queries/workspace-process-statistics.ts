import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../../builder'

builder.queryField('workspaceProcessStatistics', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['WorkspaceProcessStatistics'],
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const statistics = await workspaceProcessing.getWorkspaceStatistics(workspaceId)
      return statistics
    },
  }),
)
