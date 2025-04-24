import { getLanguageString } from '../../../../../apps/chat-web/app/i18n/get-language'
import { getTranslatedValue } from '../../../../../apps/chat-web/app/i18n/translation-utils'
import { sendMail } from '../../mailer'
import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.prismaObject('AiConversationInvitation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    email: t.exposeString('email', { nullable: false }),
    date: t.expose('date', { type: 'DateTime', nullable: false }),
    confirmationDate: t.expose('confirmationDate', { type: 'DateTime', nullable: true }),
    allowDifferentEmailAddress: t.exposeBoolean('allowDifferentEmailAddress', { nullable: false }),
    allowMultipleParticipants: t.exposeBoolean('allowMultipleParticipants', { nullable: false }),
    conversation: t.relation('conversation', { nullable: false }),
    inviter: t.relation('inviter', { nullable: false }),
    link: t.string({
      resolve: (invitation) => {
        return `${process.env.PUBLIC_APP_URL}/conversations/${invitation.conversationId}/confirm-invitation/${invitation.id}`
      },
    }),
  }),
})

const conversationInvitationInput = builder.inputType('ConversationInvitationInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    allowDifferentEmailAddress: t.boolean({ required: true }),
    allowMultipleParticipants: t.boolean({ required: true }),
    language: t.string({ required: false }),
  }),
})

const sendInvitationEmail = async ({
  email,
  language,
  conversationId,
  invitationId,
}: {
  email: string
  language: string
  conversationId: string
  invitationId: string
}) => {
  // Ensure the language is valid using getLanguageString
  const resolvedLanguage = getLanguageString([language])

  const getTranslatedContent = (key: string, placeholders?: Record<string, string | number>) =>
    getTranslatedValue(key, resolvedLanguage, placeholders)

  const subject = getTranslatedContent('invitations.invitationSubject')
  const text = getTranslatedContent('invitations.joinLinkText', {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || '',
    conversationId,
    invitationId,
  })
  const html = getTranslatedContent('invitations.joinLinkHtml', {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || '',
    conversationId,
    invitationId,
  })

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
      const link = `${process.env.PUBLIC_APP_URL}/conversations/${conversationId}/confirm-invitation/${inviterId}`

      // Check if an invitation already exists for the conversation
      const existingInvitation = await prisma.aiConversationInvitation.findUnique({
        where: { conversationId },
      })

      let invitation
      if (existingInvitation) {
        // Update the existing invitation
        invitation = await prisma.aiConversationInvitation.update({
          where: { conversationId },
          data: {
            email: data.email.trim().toLowerCase(),
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
            email: data.email.trim().toLowerCase(),
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
          language: getLanguageString([data.language || 'en']),
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
    type: 'AiConversationParticipant',
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

      // Check if the user is already a participant
      const existingParticipant = await prisma.aiConversationParticipant.findFirst({
        where: { conversationId, userId },
      })

      if (existingParticipant) {
        throw new Error('User is already a participant in this conversation')
      }

      // Check if the invitation exists
      const invitation = await prisma.aiConversationInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation) {
        throw new Error('Invitation not found or has already been used')
      }

      if (invitation.conversationId !== conversationId) {
        throw new Error('Invalid invitation for this conversation')
      }

      // Validate email based on the allowDifferentEmailAddress flag
      if (
        !invitation.allowDifferentEmailAddress &&
        (!email || invitation.email.toLowerCase() !== email.toLowerCase())
      ) {
        throw new Error('Email address does not match the invitation for this single-use invitation')
      }

      // Create the participant
      const participant = await prisma.aiConversationParticipant.create({
        data: {
          conversationId,
          userId,
        },
      })

      // Invalidate the invitation if single-participant mode
      if (!invitation.allowMultipleParticipants) {
        await prisma.aiConversationInvitation.delete({
          where: { id: invitationId },
        })
      } else {
        // Update the confirmation date for multi-use invitations
        await prisma.aiConversationInvitation.update({
          where: { id: invitationId },
          data: { confirmationDate: new Date() },
        })
      }

      return participant
    },
  }),
)
