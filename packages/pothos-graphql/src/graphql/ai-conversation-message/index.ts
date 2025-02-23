import { builder } from '../builder'
import { prisma } from '../../prisma'
import { askAssistantChain } from '@george-ai/langchain-chat'
import { callConversationMessagesUpdateSubscriptions } from '../../conversation-messages-subscription'

console.log('Setting up: AiConversationMessage')

builder.prismaObject('AiConversationMessage', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    sequenceNumber: t.expose('sequenceNumber', {
      type: 'BigInt',
      nullable: false,
    }),
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

builder.mutationField('updateMessage', (t) =>
  t.prismaField({
    type: 'AiConversationMessage',
    args: {
      messageId: t.arg.string({ required: true }),
      content: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { messageId, content }) => {
      const message = await prisma.aiConversationMessage.update({
        where: { id: messageId },
        data: { content },
      })
      return message
    },
  }),
)

builder.mutationField('deleteMessage', (t) =>
  t.prismaField({
    type: 'AiConversationMessage',
    args: {
      messageId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { messageId }) => {
      const message = await prisma.aiConversationMessage.delete({
        where: { id: messageId },
      })
      return message
    },
  }),
)

builder.mutationField('sendMessage', (t) =>
  t.prismaField({
    type: ['AiConversationMessage'],
    nullable: {
      list: false,
      items: false,
    },
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
      const assistantsToAsk = await prisma.aiAssistant.findMany({
        select: {
          id: true,
          name: true,
          conversationParticipations: {
            select: { id: true },
            where: { conversationId: data.conversationId },
          },
          usages: { select: { library: true } },
        },
        where: {
          id: {
            in: data.recipientAssistantIds,
          },
          conversationParticipations: {
            some: { conversationId: data.conversationId },
          },
        },
      })

      const history = await prisma.aiConversationMessage.findMany({
        select: {
          id: true,
          content: true,
          senderId: true,
          sender: { select: { assistant: true, user: true } },
        },
        where: { conversationId: data.conversationId },
      })

      const newUserMessage = await prisma.aiConversationMessage.create({
        data: {
          content: data.content,
          conversationId: data.conversationId,
          senderId: participant.id,
        },
      })

      await callConversationMessagesUpdateSubscriptions({
        conversationId: data.conversationId,
        message: {
          messageId: newUserMessage.id,
          sequenceNumber: newUserMessage.sequenceNumber,
          content: data.content,
          createdAt: newUserMessage.createdAt,
          updatedAt: newUserMessage.updatedAt,
          sender: {
            id: userId,
            name: participant.user?.name || 'Unknown',
            isBot: false,
          },
        },
      })

      const assistantAnswersPromises = assistantsToAsk.map(
        async (assistant) => {
          const senderId = assistant.conversationParticipations[0].id
          const newAssistantMessage = await prisma.aiConversationMessage.create(
            {
              data: {
                content: '',
                conversationId: data.conversationId,
                senderId,
              },
            },
          )

          await callConversationMessagesUpdateSubscriptions({
            conversationId: data.conversationId,
            message: {
              messageId: newAssistantMessage.id,
              sequenceNumber: newAssistantMessage.sequenceNumber,
              content: '',
              createdAt: newAssistantMessage.createdAt,
              updatedAt: newAssistantMessage.updatedAt,
              sender: {
                id: assistant.id,
                name: assistant.name,
                isBot: true,
              },
            },
          })

          let answer = ''

          for await (const answerFromAssistant of askAssistantChain({
            message: {
              id: newUserMessage.id,
              content: data.content,
              isBot: participant.assistant !== null,
              author: {
                id: participant.id,
                name: participant.user?.name || participant.assistant?.name,
              },
            },
            history: history.map((message) => ({
              id: message.id,
              content: message.content,
              author: {
                id: message.senderId,
                name:
                  message.sender.assistant?.name ||
                  message.sender.user?.name ||
                  '',
              },
              isBot: message.sender.assistant !== null,
            })),
            assistant,
            libraries: assistant.usages.map((usage) => ({
              id: usage.library.id,
              name: usage.library.name,
            })),
          })) {
            const content = answerFromAssistant
            await callConversationMessagesUpdateSubscriptions({
              conversationId: data.conversationId,
              message: {
                messageId: newAssistantMessage.id,
                sequenceNumber: newAssistantMessage.sequenceNumber,
                content,
                createdAt: newAssistantMessage.createdAt,
                updatedAt: newAssistantMessage.updatedAt,
                sender: {
                  id: assistant.id,
                  name: assistant.name,
                  isBot: true,
                },
              },
            })
            answer += content
          }

          return prisma.aiConversationMessage.update({
            where: { id: newAssistantMessage.id },
            data: { content: answer },
          })
        },
      )

      const assistantAnswers = await Promise.all(assistantAnswersPromises)

      return [newUserMessage, ...assistantAnswers]
    },
  }),
)
