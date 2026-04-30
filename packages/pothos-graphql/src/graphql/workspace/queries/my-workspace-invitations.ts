import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

// Query to get pending invitations for the current user
builder.queryField('myWorkspaceInvitations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceInvitation'],
    nullable: false,
    resolve: async (query, _root, _args, { session }) => {
      const userEmail = session.user.email

      return prisma.workspaceInvitation.findMany({
        ...query,
        where: {
          email: userEmail,
          acceptedAt: null,
          expiresAt: { gt: new Date() }, // Not expired
        },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)
