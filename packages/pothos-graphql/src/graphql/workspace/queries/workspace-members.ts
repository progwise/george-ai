import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get all members of a workspace
builder.queryField('workspaceMembers', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceMember'],
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      return prisma.workspaceMember.findMany({
        ...query,
        where: { workspaceId },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      })
    },
  }),
)
