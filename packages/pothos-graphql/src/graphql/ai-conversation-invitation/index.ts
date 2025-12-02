import { sendMail } from '../../domain/mailer'
import { PUBLIC_APP_URL } from '../../global-config'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const generateInvitationLink = (conversationId: string, invitationId: string): string => {
  return `${PUBLIC_APP_URL}/conversations/${conversationId}/confirm-invitation/${invitationId}`
}

const conversationInvitationInput = builder.inputType('ConversationInvitationInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    allowDifferentEmailAddress: t.boolean({ required: true }),
    allowMultipleParticipants: t.boolean({ required: true }),
  }),
})

const sendInvitationEmail = async ({
  email,
  conversationId,
  invitationId,
}: {
  email: string
  conversationId: string
  invitationId: string
}) => {
  const link = generateInvitationLink(conversationId, invitationId)
  const subject = 'You are invited to a conversation at George-Ai'
  const text = `You have been invited to join a conversation at George-Ai (george-ai.net). Use this link to join: ${link}`
  const html = `<p>You have been invited to join a conversation at George-Ai (george-ai.net). Use this link to join: <a href="${link}">${link}</a></p>`

  await sendMail(email, subject, text, html)
}

builder.mutationField('createConversationInvitations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversation',
    args: {
      conversationId: t.arg.string({ required: true }),
      data: t.arg({
        type: [conversationInvitationInput],
        required: true,
      }),
    },
    resolve: async (_query, _source, { conversationId, data }, context) => {
      if (!data || data.length === 0) {
        throw new Error('At least one invitation is required')
      }

      // Prepare the data for creating invitations
      const invitationsData = data.map((invitation) => ({
        email: invitation.email.trim().toLowerCase(),
        allowDifferentEmailAddress: invitation.allowDifferentEmailAddress,
        allowMultipleParticipants: invitation.allowMultipleParticipants,
        conversationId,
        inviterId: context.session.user.id,
      }))

      // Create multiple invitations
      await prisma.aiConversationInvitation.createMany({
        data: invitationsData,
        skipDuplicates: true,
      })

      // Send emails for each created invitation
      const createdInvitations = await prisma.aiConversationInvitation.findMany({
        where: { conversationId },
      })

      await Promise.all(
        createdInvitations.map((invitation) =>
          sendInvitationEmail({
            email: invitation.email,
            conversationId,
            invitationId: invitation.id,
          }).catch((error) => {
            console.error('Error sending invitation email:', error)
          }),
        ),
      )

      // Return the conversation
      return prisma.aiConversation.findUnique({
        where: { id: conversationId },
      })
    },
  }),
)

builder.mutationField('confirmConversationInvitation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversation',
    args: {
      conversationId: t.arg.string({ required: true }),
      invitationId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { conversationId, invitationId }, context) => {
      const user = context.session.user
      // Validate if the conversation exists
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Check if the invitation exists and matches the conversation
      const invitation = await prisma.aiConversationInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation || invitation.conversationId !== conversationId) {
        throw new Error(!invitation ? 'Invitation not found' : 'Invalid invitation')
      }

      // Check if the invitation is already used and not allowed for multiple participants
      if (invitation.isUsed && !invitation.allowMultipleParticipants) {
        throw new Error('Invitation already used')
      }

      // Check if the user is already a participant
      const existingParticipant = await prisma.aiConversationParticipant.findFirst({
        where: { conversationId, userId: user.id },
      })

      if (existingParticipant) {
        throw new Error('User is already a participant')
      }

      // Validate email based on the allowDifferentEmailAddress flag
      if (
        !invitation.allowDifferentEmailAddress &&
        (!user.email || invitation.email.toLowerCase() !== user.email.toLowerCase())
      ) {
        throw new Error('Email address does not match the invitation for this single-use invitation')
      }

      // Create the participant
      await prisma.aiConversationParticipant.create({
        data: {
          conversationId,
          userId: user.id,
        },
      })

      // Update the confirmation date and confirmedByEmail
      await prisma.aiConversationInvitation.update({
        where: { id: invitationId },
        data: {
          confirmationDate: new Date(),
          confirmedByEmail: user.email?.toLowerCase() || invitation.email.toLowerCase(),
          isUsed: true,
        },
      })

      // Return the updated conversation
      return prisma.aiConversation.findUnique({
        where: { id: conversationId },
      })
    },
  }),
)
