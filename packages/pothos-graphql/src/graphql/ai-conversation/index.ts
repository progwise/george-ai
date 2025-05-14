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
  t.prismaField({
    type: 'AiConversation',
    args: {
      conversationId: t.arg.string(),
    },
    resolve: (query, _source, { conversationId }) => {
      return prisma.aiConversation.findUnique({
        ...query,
        where: { id: conversationId },
      })
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
    resolve: (query, _source, _args, { user }) => {
      return prisma.aiConversation.findMany({
        ...query,
        where: { participants: { some: { userId: user.id } } },
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
    resolve: async (_query, _source, { data }, { user }) => {
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
            email: user.email.trim().toLowerCase(),
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

builder.mutationField('removeAiConversations', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      conversationIds: t.arg.stringList({ required: true }),
    },
    resolve: async (_source, { conversationIds }, { user }) => {
      await prisma.aiConversation.deleteMany({
        where: {
          ownerId: user.id,
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
          userId: user.id,
        },
      })
      return true
    },
  }),
)
