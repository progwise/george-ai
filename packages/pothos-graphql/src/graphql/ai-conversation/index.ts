import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiConversation')

builder.prismaObject('AiConversation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    participants: t.relation('participants', { nullable: false }),
    messages: t.relation('messages', {
      nullable: false,
      query: () => ({ orderBy: [{ sequenceNumber: 'asc' }] }),
    }),
    humans: t.prismaField({
      type: ['User'],
      nullable: {
        list: false,
        items: false,
      },
      resolve: (query, source) => {
        return prisma.user.findMany({
          ...query,
          where: {
            conversationParticipations: {
              some: { conversationId: source.id },
            },
          },
        })
      },
    }),
    assistants: t.prismaField({
      type: ['AiAssistant']!,
      nullable: {
        list: false,
        items: false,
      },
      resolve: (query, source) => {
        return prisma.aiAssistant.findMany({
          ...query,
          where: {
            conversationParticipations: {
              some: { conversationId: source.id },
            },
          },
        })
      },
    }),
    owner: t.relation('owner', { nullable: false }),
    ownerId: t.exposeString('ownerId', { nullable: false }),
  }),
})

builder.queryField('aiConversation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversation',
    args: {
      conversationId: t.arg.string(),
    },
    resolve: async (query, _source, { conversationId }, context) => {
      const user = context.session.user
      const conversation = await prisma.aiConversation.findUnique({
        ...query,
        where: { id: conversationId },
      })
      if (!conversation) return null
      if (
        user.isAdmin ||
        conversation.ownerId === user.id ||
        (await prisma.aiConversationParticipant.count({
          where: {
            conversationId,
            OR: [{ userId: user.id }, { assistant: { ownerId: user.id } }],
          },
        })) > 0
      ) {
        return conversation
      }
      return null
    },
  }),
)

builder.queryField('aiConversations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiConversation'],
    nullable: {
      list: false,
      items: false,
    },
    resolve: (query, _source, _args, context) => {
      return prisma.aiConversation.findMany({
        ...query,
        where: { participants: { some: { userId: context.session.user.id } } },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)

const conversationCreateInput = builder.inputType('AiConversationCreateInput', {
  fields: (t) => ({
    assistantIds: t.stringList({ required: true }),
    userIds: t.stringList({ required: true }),
  }),
})

builder.mutationField('createAiConversation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversation',
    args: {
      data: t.arg({ type: conversationCreateInput, required: true }),
    },
    resolve: async (_query, _source, { data }, context) => {
      const user = context.session.user
      const conversation = await prisma.aiConversation.create({
        data: {
          participants: {
            create: [
              ...data.assistantIds.map((assistantId) => ({
                assistantId,
              })),
              ...data.userIds.map((userId) => ({ userId })),
            ],
          },
          ownerId: user.id,
        },
      })

      // Create the invitation only if an email is provided
      if (user.email && user.email.trim() !== '') {
        await prisma.aiConversationInvitation.create({
          data: {
            email: user.email,
            allowDifferentEmailAddress: false,
            allowMultipleParticipants: false,
            conversationId: conversation.id,
            inviterId: user.id,
          },
        })
      }

      return conversation
    },
  }),
)

builder.mutationField('deleteAiConversation', (t) =>
  t.prismaField({
    type: 'AiConversation',
    args: {
      conversationId: t.arg.string({ required: true }),
    },
    resolve: (_query, _source, { conversationId }) => {
      return prisma.aiConversation.delete({
        where: { id: conversationId },
      })
    },
  }),
)

builder.mutationField('deleteAiConversations', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      conversationIds: t.arg.stringList({ required: true }),
    },
    resolve: async (_source, { conversationIds }, context) => {
      const userId = context.session.user.id
      await prisma.aiConversation.deleteMany({
        where: {
          ownerId: userId,
          id: {
            in: conversationIds,
          },
        },
      })
      await prisma.aiConversationParticipant.deleteMany({
        where: {
          conversationId: {
            in: conversationIds,
          },
          userId,
        },
      })
      return true
    },
  }),
)
