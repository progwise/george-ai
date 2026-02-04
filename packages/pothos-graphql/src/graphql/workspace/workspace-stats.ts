import { canReadWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../builder'

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
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      await canReadWorkspaceOrThrow(args.workspaceId, ctx.session.user.id)

      const workspaceStats = await workspace.getStats({ workspaceId: args.workspaceId, userId: ctx.session.user.id })

      return workspaceStats
    },
  }),
)
