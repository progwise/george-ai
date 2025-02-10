import { builder } from '../builder'
import { prisma } from '../../prisma'

builder.prismaObject('AiConversationParticipant', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: true }),
    user: t.relation('user'),
    conversationId: t.exposeID('aiConversationId', { nullable: false }),
    conversation: t.relation('aiConversation'),
    assistantId: t.exposeID('assistantId', { nullable: true }),
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
    conversationId: t.exposeID('aiConversationId', { nullable: false }),
    conversation: t.relation('AiConversation'),
  }),
})

builder.prismaObject('AiConversation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    participants: t.relation('participants'),
    messages: t.relation('messages'),
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
      ownerId: t.arg.string(),
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.aiConversation.findMany({
        ...query,
        where: { participants: { some: { userId: ownerId } } },
      })
    },
  }),
)
