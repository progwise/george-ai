import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { prisma } from '@george-ai/app-database'
import { INVITATION_EXPIRY_DAYS, canAdminWorkspaceOrThrow, sendWorkspaceInvitationEmail } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Invite a member to a workspace (admin only)
builder.mutationField('inviteWorkspaceMember', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceInvitation',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      email: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { workspaceId, email }, ctx) => {
      const userId = ctx.session.user.id

      // Validate email format
      const emailSchema = z.string().email()
      const validatedEmail = emailSchema.parse(email.toLowerCase().trim())

      // Check if user is admin
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      // Check if user is already a member
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedEmail },
      })

      if (existingUser) {
        const existingMembership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: { workspaceId, userId: existingUser.id },
          },
        })

        if (existingMembership) {
          throw new GraphQLError('User is already a member of this workspace')
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.workspaceInvitation.findUnique({
        where: {
          workspaceId_email: { workspaceId, email: validatedEmail },
        },
      })

      if (existingInvitation && !existingInvitation.acceptedAt) {
        throw new GraphQLError('An invitation has already been sent to this email')
      }

      // Create invitation with expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS)

      const invitation = await prisma.workspaceInvitation.upsert({
        ...query,
        where: {
          workspaceId_email: { workspaceId, email: validatedEmail },
        },
        create: {
          workspaceId,
          email: validatedEmail,
          inviterId: userId,
          expiresAt,
        },
        update: {
          inviterId: userId,
          expiresAt,
          acceptedAt: null,
        },
      })

      // Send invitation email
      await sendWorkspaceInvitationEmail(invitation.id, workspaceId, userId, validatedEmail)

      return invitation
    },
  }),
)
