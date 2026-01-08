import { workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { WorkspaceStatistics } from './types'

builder.queryField('workspaceEvents', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: WorkspaceStatistics,
    nullable: false,
    resolve: async (_root, _args, context) => {
      const workspaceId = context.workspaceId
      const stats = await workspace.getWorkspaceStatistics(workspaceId)
      return {
        workspaceId,
        eventMessageStatistics: stats,
      }
    },
  }),
)
