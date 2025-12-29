import { prisma } from '@george-ai/app-domain'

import { builder } from '../builder'

// Query to get all providers for the current workspace
builder.queryField('aiServiceProviders', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiServiceProvider'],
    nullable: { list: false, items: false },
    args: {
      enabled: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _source, { enabled }, context) => {
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

// Query to get a specific provider by ID (workspace-scoped)
builder.queryField('aiServiceProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      return prisma.aiServiceProvider.findFirstOrThrow({
        ...query,
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)
