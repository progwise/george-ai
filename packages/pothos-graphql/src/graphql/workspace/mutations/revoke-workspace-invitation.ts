import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Revoke a pending invitation (admin only)
builder.mutationField('revokeWorkspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      invitationId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { invitationId }, ctx) => {
      const userId = ctx.session.user.id

      // Get the invitation
      const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation) {
        throw new GraphQLError('Invitation not found')
      }

      // Check if user is admin of the workspace
      await canAdminWorkspaceOrThrow(invitation.workspaceId, userId)

      // Delete the invitation
      await prisma.workspaceInvitation.delete({
        where: { id: invitationId },
      })

      return true
    },
  }),
)
