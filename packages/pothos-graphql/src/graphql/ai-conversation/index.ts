import { builder } from '../builder'
import { prisma } from '../../prisma'
import { askAssistantChain } from '@george-ai/langchain-chat'

console.log('Setting up: AiConversation')

builder.prismaObject('AiConversationMessage', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    content: t.expose('content', { type: 'String' }),
    source: t.expose('source', { type: 'String', nullable: true }),
    senderId: t.exposeID('senderId', { nullable: false }),
    sender: t.relation('sender', { nullable: false }),
    conversationId: t.exposeID('conversationId', { nullable: false }),
    conversation: t.relation('conversation'),
  }),
})

builder.prismaObject('AiConversation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    participants: t.relation('participants', { nullable: false }),
    messages: t.relation('messages'),
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
    nullable: {
      list: false,
      items: false,
    },
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
    recipientAssistantIds: t.stringList({ required: true }),
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
          select: { id: true, user: true, assistant: true },
          where: { conversationId: data.conversationId, userId },
        })
      const assistants = await prisma.aiAssistant.findMany({
        select: { id: true, name: true, usages: true },
        where: {
          conversationParticipations: {
            some: { conversationId: data.conversationId },
          },
        },
      })
      const assistantsToQuery = assistants.filter((assistant) =>
        data.recipientAssistantIds.includes(assistant.id),
      )

      const librariesToQuery = await prisma.aiLibrary.findMany({
        where: {
          usages: {
            some: {
              assistantId: {
                in: assistantsToQuery.map((assistant) => assistant.id),
              },
            },
          },
        },
      })

      const users = await prisma.user.findMany({
        select: { id: true, name: true },
        where: {
          conversationParticipations: {
            some: { conversationId: data.conversationId },
          },
        },
      })

      const history = await prisma.aiConversationMessage.findMany({
        select: { id: true, content: true, senderId: true, sender: true },
        where: { conversationId: data.conversationId },
      })

      const historyMessages = history.map((message) => ({
        id: message.id,
        content: message.content,
        isBot: message.sender.assistantId !== null,
        author: message.sender.assistantId
          ? assistants[
              assistants.findIndex(
                (assistant) => assistant.id === message.sender.assistantId,
              )
            ]
          : users[users.findIndex((user) => user.id === message.sender.userId)],
      }))

      const newMessage = await prisma.aiConversationMessage.create({
        data: {
          content: data.content,
          conversationId: data.conversationId,
          senderId: participant.id,
        },
      })

      const assistantAnswersPromises = assistantsToQuery.map(
        async (assistant) => {
          const message = {
            id: newMessage.id,
            content: newMessage.content,
            author: {
              id: participant.id,
              name: participant.user?.name || participant.assistant?.name,
            },
            isBot: participant.assistant !== null,
          }
          const history = historyMessages
          const answerFromAssistant = await askAssistantChain({
            message,
            history,
            assistant,
            libraries: assistant.usages.map((usage) => ({
              id: usage.libraryId,
              name:
                librariesToQuery.find(
                  (library) => library.id === usage.libraryId,
                )?.name || '',
            })),
          })
          return { assistant, answer: answerFromAssistant }
        },
      )

      const assistantAnswers = await Promise.all(assistantAnswersPromises)
      const createAnswerEntries = assistantAnswers.map(
        async ({ assistant, answer }) => {
          const participant = await prisma.aiConversationParticipant.findFirst({
            where: {
              conversationId: data.conversationId,
              assistantId: assistant.id,
            },
          })
          return await prisma.aiConversationMessage.create({
            data: {
              content: answer.response,
              senderId: participant!.id,
              conversationId: data.conversationId,
            },
          })
        },
      )

      await Promise.all(createAnswerEntries)

      return newMessage
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
    resolve: (_query, _source, { data }) =>
      prisma.aiConversation.create({
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
      }),
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
