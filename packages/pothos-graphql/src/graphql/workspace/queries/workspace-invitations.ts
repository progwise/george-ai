import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get pending invitations for a workspace (admin only)
builder.queryField('workspaceInvitations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['WorkspaceInvitation'],
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { workspaceId }, { session }) => {
      // Verify the user is an admin of this workspace
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      return prisma.workspaceInvitation.findMany({
        ...query,
        where: {
          workspaceId,
          acceptedAt: null, // Only pending invitations
        },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)
