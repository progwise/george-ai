import { canReadWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'
import { logger } from './common'

const WorkspaceStats = builder.simpleObject('WorkspaceStats', {
  description: 'Statistics and metadata about a workspace',
  fields: (t) => ({
    id: t.id(),
    name: t.string(),
    slug: t.string(),
    isDefault: t.boolean(),
    isAdmin: t.boolean(),
    embeddingInfo: t.field({
      type: ['EmbeddingInfo'],
      nullable: true,
    }),
    roles: t.field({
      type: ['Role'],
      nullable: { list: false, items: false },
    }),
    memberCount: t.int(),
    workspaceInfo: t.field({
      type: 'WorkspaceManifest',
      nullable: true,
    }),
  }),
})

builder.queryField('workspaceStats', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: WorkspaceStats,
    nullable: true,
    args: {},
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const workspaceStats = await workspace.getStats({ workspaceId, userId: session.user.id })

        return workspaceStats
      } catch (error) {
        logger.error('Error fetching workspace stats', { workspaceId, userId: session.user.id, error })
        throw error
      }
    },
  }),
)
