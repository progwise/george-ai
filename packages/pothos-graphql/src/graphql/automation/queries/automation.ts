import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get a specific automation by ID
builder.queryField('automation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _source, { id }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      return prisma.aiAutomation.findFirstOrThrow({
        ...query,
        where: {
          id: String(id),
          workspaceId,
        },
      })
    },
  }),
)
