import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

// Accept a workspace invitation
builder.mutationField('acceptWorkspaceInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      invitationId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { invitationId }, ctx) => {
      const userId = ctx.session.user.id
      const userEmail = ctx.session.user.email

      // Get the invitation
      const invitation = await prisma.workspaceInvitation.findUniqueOrThrow({
        where: { id: invitationId, acceptedAt: null, expiresAt: { gt: new Date() } }, // Must be pending and not expired
      })

      // Check if invitation is for this user's email
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        throw new GraphQLError('This invitation was sent to a different email address')
      }

      // Check if already a member
      const existingMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: invitation.workspaceId, userId },
        },
      })

      if (existingMembership) {
        // Mark invitation as accepted and return existing membership
        await prisma.workspaceInvitation.update({
          ...query,
          where: { id: invitationId },
          data: { acceptedAt: new Date() },
        })
        throw new GraphQLError('You are already a member of this workspace. Invitation marked as accepted.')
      }

      // Create membership and mark invitation as accepted
      const [member] = await prisma.$transaction([
        prisma.workspaceMember.create({
          ...query,
          data: {
            workspaceId: invitation.workspaceId,
            userId,
            role: 'member',
          },
        }),
        prisma.workspaceInvitation.update({
          where: { id: invitationId },
          data: { acceptedAt: new Date() },
        }),
      ])

      return member
    },
  }),
)
