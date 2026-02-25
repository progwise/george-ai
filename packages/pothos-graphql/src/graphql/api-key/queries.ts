import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.queryField('apiKeys', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['ApiKey'],
    nullable: false,
    args: {},
    resolve: async (query, _source, _args, { workspaceId, session }) => {
      // Check if user has access to this workspace
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      // Return all API keys for this workspace
      return prisma.apiKey.findMany({
        ...query,
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)
