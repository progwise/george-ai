import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

// Query to get a single invitation by ID (for accept-invitation page)
// Returns the invitation regardless of email match - frontend handles the different states

builder.queryField('workspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceInvitation',
    nullable: false,
    args: {
      invitationId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { invitationId }) => {
      return prisma.workspaceInvitation.findUniqueOrThrow({
        ...query,
        where: { id: invitationId },
      })
    },
  }),
)
