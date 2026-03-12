import { canAdminWorkspaceOrThrow, migrateWorkspace } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('migrateWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'WorkspaceManifest',
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { workspaceId }, { session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)
      logger.debug('Starting workspace migration from legacy', { workspaceId, userId: session.user.id })
      const result = await migrateWorkspace({ workspaceId })
      return result
    },
  }),
)
