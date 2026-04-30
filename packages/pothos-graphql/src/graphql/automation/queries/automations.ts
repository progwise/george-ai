import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get all automations for the current workspace
builder.queryField('automations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAutomation'],
    nullable: { list: false, items: false },
    args: {
      listId: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { listId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      return prisma.aiAutomation.findMany({
        ...query,
        where: {
          workspaceId,
          ...(listId ? { listId } : {}),
        },
        orderBy: [{ name: 'asc' }],
      })
    },
  }),
)
