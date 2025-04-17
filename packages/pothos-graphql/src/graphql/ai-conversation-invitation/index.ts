import { PUBLIC_APP_URL } from '../../../../../apps/chat-web/app/constants'
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
        return `${PUBLIC_APP_URL}/conversations/${invitation.conversationId}/confirm-invitation/${invitation.id}`
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

builder.mutationField('createConversationInvitation', (t) =>
  t.prismaField({
    type: 'AiConversationInvitation',
    args: {
      conversationId: t.arg.string({ required: true }),
      inviterId: t.arg.string({ required: true }),
      data: t.arg({ type: conversationInvitationInput, required: true }),
    },
    resolve: async (_query, _source, { conversationId, inviterId, data }) => {
      try {
        const invitation = await prisma.aiConversationInvitation.create({
          data: {
            email: data.email,
            allowDifferentEmailAddress: data.allowDifferentEmailAddress,
            allowMultipleParticipants: data.allowMultipleParticipants,
            conversationId,
            inviterId,
          },
        })

        const language = data.language === 'de' || data.language === 'en' ? data.language : 'en'

        const getTranslatedContent = (key: string, placeholders?: Record<string, string | number>) =>
          getTranslatedValue(key, language, placeholders)

        const subject = getTranslatedContent('invitations.invitationSubject')
        const text = getTranslatedContent('invitations.joinLinkText', {
          PUBLIC_APP_URL,
          conversationId,
          invitationId: invitation.id,
        })
        const html = getTranslatedContent('invitations.joinLinkHtml', {
          PUBLIC_APP_URL,
          conversationId,
          invitationId: invitation.id,
        })

        await sendMail(data.email, subject, text, html)

        return invitation
      } catch (error) {
        console.error('Error creating invitation or sending email:', error)
        throw new Error('Failed to create invitation or send email')
      }
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
    },
    resolve: async (_query, _source, { conversationId, invitationId, userId }) => {
      const invitation = await prisma.aiConversationInvitation.findUnique({
        where: { id: invitationId },
      })

      if (!invitation || invitation.conversationId !== conversationId) {
        throw new Error('Invalid invitation')
      }

      await prisma.aiConversationInvitation.update({
        where: { id: invitationId },
        data: { confirmationDate: new Date() },
      })

      return prisma.aiConversationParticipant.create({
        data: {
          conversationId,
          userId,
        },
      })
    },
  }),
)
