import { builder } from '../builder'
import { prisma } from '../../prisma'

const participantInterface = builder.prismaInterface(
  'AiConversationParticipant',
  {
    name: 'AiConversationParticipant',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      userId: t.exposeID('userId', { nullable: true }),
      user: t.relation('user'),
      conversationId: t.exposeID('conversationId', { nullable: false }),
      conversation: t.relation('conversation'),
      assistantId: t.exposeID('assistantId', { nullable: true }),
      assistant: t.relation('assistant'),
      name: t.field({
        type: 'String',
        resolve: async (source) => {
          if (source.userId) {
            const user = await prisma.user.findUniqueOrThrow({
              where: { id: source.userId! },
            })
            return user?.name
          }
          if (source.assistantId) {
            const assistant = await prisma.aiAssistant.findUniqueOrThrow({
              where: { id: source.assistantId! },
            })
            return assistant?.name
          }
          throw new Error('Participant unknown: ' + source.id)
        },
      }),
    }),
    resolveType: (source) => {
      if (source.userId) {
        return 'HumanParticipant'
      }
      return 'AssistantParticipant'
    },
  },
)

builder.prismaObject('AiConversationParticipant', {
  variant: 'HumanParticipant',
  interfaces: [participantInterface],
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    user: t.relation('user'),
  }),
})

builder.prismaObject('AiConversationParticipant', {
  variant: 'AssistantParticipant',
  interfaces: [participantInterface],
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    assistant: t.relation('assistant'),
  }),
})

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
        orderBy: { createdAt: 'desc' },
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
