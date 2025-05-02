import { sendMail } from '../../mailer'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const generateInvitationLink = (conversationId: string, invitationId: string): string => {
  return `${process.env.PUBLIC_APP_URL}/conversations/${conversationId}/confirm-invitation/${invitationId}`
}

builder.prismaObject('AiConversationInvitation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    email: t.exposeString('email', { nullable: false }),
    date: t.expose('date', { type: 'DateTime', nullable: false }),
    allowDifferentEmailAddress: t.exposeBoolean('allowDifferentEmailAddress', { nullable: false }),
    allowMultipleParticipants: t.exposeBoolean('allowMultipleParticipants', { nullable: false }),
    isUsed: t.exposeBoolean('isUsed', { nullable: false }),
    conversation: t.relation('conversation', { nullable: false }),
    inviter: t.relation('inviter', { nullable: false }),
    link: t.string({
      resolve: (invitation) => {
        return generateInvitationLink(invitation.conversationId, invitation.id)
      },
    }),
  }),
})

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

builder.mutationField('createConversationInvitation', (t) =>
  t.prismaField({
    type: 'AiConversationInvitation',
    args: {
      conversationId: t.arg.string({ required: true }),
      inviterId: t.arg.string({ required: true }),
      data: t.arg({ type: conversationInvitationInput, required: true }),
    },
    resolve: async (_query, _source, { conversationId, inviterId, data }) => {
      // Validate that the email is not empty
      if (!data.email || data.email.trim() === '') {
        throw new Error('Email is required to create an invitation')
      }

      // Generate the link for the invitation
      const link = generateInvitationLink(conversationId, inviterId)

      // Check if an invitation already exists for the conversation
      const existingInvitation = await prisma.aiConversationInvitation.findUnique({
        where: { conversationId },
      })

      let invitation
      const formattedEmail = data.email.trim().toLowerCase()

      if (existingInvitation) {
        // Update the existing invitation
        invitation = await prisma.aiConversationInvitation.update({
          where: { conversationId },
          data: {
            email: formattedEmail,
            link,
            allowDifferentEmailAddress: data.allowDifferentEmailAddress,
            allowMultipleParticipants: data.allowMultipleParticipants,
            inviterId,
          },
        })
      } else {
        // Create a new invitation
        invitation = await prisma.aiConversationInvitation.create({
          data: {
            email: formattedEmail,
            link,
            allowDifferentEmailAddress: data.allowDifferentEmailAddress,
            allowMultipleParticipants: data.allowMultipleParticipants,
            conversationId,
            inviterId,
          },
        })
      }

      try {
        await sendInvitationEmail({
          email: data.email.trim(),
          conversationId,
          invitationId: invitation.id,
        })
      } catch (error) {
        console.error('Error sending invitation email:', error)
        throw new Error('Failed to send invitation email')
      }

      return invitation
    },
  }),
)

builder.mutationField('confirmConversationInvitation', (t) =>
  t.prismaField({
    type: 'AiConversationInvitation',
    args: {
      conversationId: t.arg.string({ required: true }),
      invitationId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
      email: t.arg.string({ required: false }),
    },
    resolve: async (_query, _source, { conversationId, invitationId, userId, email }) => {
      // Validate if the conversation exists
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Check if the invitation exists
      const invitation = await prisma.aiConversationInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      if (invitation.conversationId !== conversationId) {
        throw new Error('Invalid invitation')
      }

      // Check if the invitation is already used
      if (invitation.isUsed) {
        throw new Error('Invitation already used')
      }

      // Check if the user is already a participant
      const existingParticipant = await prisma.aiConversationParticipant.findFirst({
        where: { conversationId, userId },
      })

      if (existingParticipant) {
        throw new Error('User is already a participant')
      }

      // Validate email based on the allowDifferentEmailAddress flag
      if (
        !invitation.allowDifferentEmailAddress &&
        (!email || invitation.email.toLowerCase() !== email.toLowerCase())
      ) {
        throw new Error('Email address does not match the invitation for this single-use invitation')
      }

      // Create the participant
      await prisma.aiConversationParticipant.create({
        data: {
          conversationId,
          userId,
        },
      })

      // Update the confirmation date and confirmedByEmail
      const updateData: {
        confirmationDate: Date
        confirmedByEmail: string
        isUsed?: boolean
      } = {
        confirmationDate: new Date(),
        confirmedByEmail: email?.toLowerCase() || invitation.email.toLowerCase(),
      }

      // Mark the invitation as used if it is single-use
      if (!invitation.allowMultipleParticipants) {
        updateData.isUsed = true
      }

      return prisma.aiConversationInvitation.update({
        where: { id: invitationId },
        data: updateData,
      })
    },
  }),
)
