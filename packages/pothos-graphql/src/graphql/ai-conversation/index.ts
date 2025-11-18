import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiConversation')

const ConversationSortOrder = builder.enumType('ConversationSortOrder', {
  values: ['createdAtAsc', 'createdAtDesc', 'updatedAtAsc', 'updatedAtDesc'] as const,
})

builder.prismaObject('AiConversation', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    participants: t.prismaField({
      type: ['AiConversationParticipant'],
      nullable: false,
      resolve: async (query, source) => {
        const participants = await prisma.aiConversationParticipant.findMany({
          ...query,
          where: { conversationId: source.id },
          include: {
            user: true,
            assistant: true,
          },
        })

        // Sort: humans first (owner first among humans), then assistants
        return participants.sort((a, b) => {
          // Humans first, then assistants
          const typeComparison = Number(!!b.userId) - Number(!!a.userId)
          if (typeComparison !== 0) return typeComparison

          // Among humans, owner first
          if (a.userId && b.userId) {
            return Number(b.userId === source.ownerId) - Number(a.userId === source.ownerId)
          }

          return 0
        })
      },
    }),
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

      const isAuthorized =
        user.isAdmin ||
        conversation.ownerId === user.id ||
        (await prisma.aiConversationParticipant.findFirst({
          where: {
            conversationId,
            OR: [{ userId: user.id }, { assistant: { ownerId: user.id } }],
          },
        })) != null

      if (!isAuthorized) return null
      return conversation
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
    args: {
      orderBy: t.arg({ type: ConversationSortOrder, required: false }),
    },
    resolve: (query, _source, args, context) => {
      const orderBy = args.orderBy || 'updatedAtDesc'
      const orderByClause =
        orderBy === 'createdAtAsc'
          ? { createdAt: 'asc' as const }
          : orderBy === 'createdAtDesc'
            ? { createdAt: 'desc' as const }
            : orderBy === 'updatedAtAsc'
              ? { updatedAt: 'asc' as const }
              : { updatedAt: 'desc' as const }

      return prisma.aiConversation.findMany({
        ...query,
        where: { participants: { some: { userId: context.session.user.id } } },
        orderBy: orderByClause,
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

const ConversationFeedbackCreateInput = builder.inputType('ConversationFeedbackCreateInput', {
  fields: (t) => ({
    originalContext: t.string({ required: true }),
    originalAnswer: t.string({ required: true }),
    feedback: t.string({ required: true }),
    answerMessageId: t.string({ required: true }),
    languageModel: t.string({ required: false }),
    answerAssistantId: t.string({ required: false }),
    answerUserId: t.string({ required: false }),
    feedbackSuggestion: t.string({ required: false }),
  }),
})

builder.mutationField('createConversationFeedback', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversationFeedback',
    args: {
      data: t.arg({ type: ConversationFeedbackCreateInput, required: true }),
    },
    resolve: async (_query, _source, { data }, context) => {
      const userId = context.session.user.id
      const result = await prisma.aiConversationFeedback.create({
        data: {
          originalContext: data.originalContext,
          originalAnswer: data.originalAnswer,
          languageModelName: data.languageModel,
          answerMessageId: data.answerMessageId,
          answerAssistantId: data.answerAssistantId,
          answerUserId: data.answerUserId,
          feedback: data.feedback,
          feedbackSuggestion: data.feedbackSuggestion,
          feedbackUserId: userId,
        },
      })

      return result
    },
  }),
)

const ConversationFeedbackUpdateInput = builder.inputType('ConversationFeedbackUpdateInput', {
  fields: (t) => ({
    feedback: t.string({ required: true }),
    feedbackSuggestion: t.string({ required: false }),
  }),
})

builder.mutationField('updateConversationFeedback', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversationFeedback',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: ConversationFeedbackUpdateInput, required: true }),
    },
    resolve: async (_query, _source, { id, data }, context) => {
      const result = await prisma.aiConversationFeedback.update({
        where: { id, feedbackUserId: context.session.user.id },
        data,
      })
      return result
    },
  }),
)

builder.mutationField('deleteConversationFeedback', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversationFeedback',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }, context) => {
      return await prisma.aiConversationFeedback.delete({
        where: { id, feedbackUserId: context.session.user.id },
      })
    },
  }),
)

const ConversationFeedbackSuggestionInput = builder.inputType('ConversationFeedbackSuggestionInput', {
  fields: (t) => ({
    feedbackSuggestion: t.string({ required: false }),
  }),
})

builder.mutationField('changeConversationFeedbackSuggestion', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiConversationFeedback',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: ConversationFeedbackSuggestionInput, required: true }),
    },
    resolve: async (_query, _source, { id, data }, context) => {
      return await prisma.aiConversationFeedback.update({
        where: { id, feedbackUserId: context.session.user.id },
        data: {
          feedbackSuggestion: data.feedbackSuggestion ?? null,
        },
      })
    },
  }),
)
