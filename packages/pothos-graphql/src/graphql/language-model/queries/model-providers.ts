import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get all providers for the current workspace
builder.queryField('modelProviders', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiServiceProvider'],
    nullable: { list: false, items: false },
    args: {
      enabled: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _source, { enabled }, context) => {
      await canReadWorkspaceOrThrow(context.workspaceId, context.session.user.id)

      return prisma.aiServiceProvider.findMany({
        ...query,
        where: {
          workspaceId: context.workspaceId,
          ...(enabled !== undefined && enabled !== null ? { enabled } : {}),
        },
        orderBy: [{ provider: 'asc' }, { name: 'asc' }],
      })
    },
  }),
)
