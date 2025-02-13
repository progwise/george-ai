import { builder } from '../builder'
import { prisma } from '../../prisma'

console.log('Setting up: AiConversation')

builder.prismaObject('AiConversationMessage', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    content: t.expose('content', { type: 'String' }),
    senderId: t.exposeID('senderId', { nullable: false }),
    sender: t.relation('sender'),
    conversationId: t.exposeID('conversationId', { nullable: false }),
    conversation: t.relation('conversation'),
  }),
})

builder.prismaObject('AiConversation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    participants: t.relation('participants'),
    humans: t.prismaField({
      type: ['User'],
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
      type: ['AiAssistant'],
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
  t.prismaField({
    type: ['AiConversation'],
    args: {
      userId: t.arg.string(),
    },
    resolve: (query, _source, { userId }) => {
      return prisma.aiConversation.findMany({
        ...query,
        where: { participants: { some: { userId } } },
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
)

builder.queryField('aiConversationMessages', (t) =>
  t.prismaField({
    type: ['AiConversationMessage'],
    args: {
      conversationId: t.arg.string(),
      userId: t.arg.string(),
    },
    resolve: (query, _source, { conversationId, userId }) => {
      const participant = prisma.aiConversationParticipant.findFirst({
        where: { conversationId, userId },
      })
      if (!participant) {
        throw new Error('User is not a participant in this conversation')
      }
      return prisma.aiConversationMessage.findMany({
        ...query,
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      })
    },
  }),
)

const messageInput = builder.inputType('AiConversationMessageInput', {
  fields: (t) => ({
    conversationId: t.string({ required: true }),
    content: t.string({ required: true }),
  }),
})

builder.mutationField('sendMessage', (t) =>
  t.prismaField({
    type: 'AiConversationMessage',
    args: {
      userId: t.arg.string({ required: true }),
      data: t.arg({ type: messageInput, required: true }),
    },
    resolve: async (_query, _source, { userId, data }) => {
      const participant =
        await prisma.aiConversationParticipant.findFirstOrThrow({
          where: { conversationId: data.conversationId, userId },
        })

      return prisma.aiConversationMessage.create({
        data: {
          ...data,
          senderId: participant.id,
        },
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
  t.prismaField({
    type: 'AiConversation',
    args: {
      data: t.arg({ type: conversationCreateInput, required: true }),
    },
    resolve: async (_query, _source, { data }) => {
      const conversation = prisma.aiConversation.create({
        data: {
          participants: {
            create: [
              ...data.assistantIds.map((assistantId) => ({
                assistantId,
              })),
              ...data.userIds.map((userId) => ({ userId })),
            ],
          },
        },
      })
      return conversation
    },
  }),
)
