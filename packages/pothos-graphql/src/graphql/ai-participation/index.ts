import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiParticipation')

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
      isAssistant: t.field({
        type: 'Boolean',
        resolve: async (source) => !!source.assistantId,
      }),
      isHuman: t.field({
        type: 'Boolean',
        resolve: async (source) => !!source.userId,
      }),
      isBot: t.field({
        nullable: false,
        type: 'Boolean',
        resolve: async (source) => !source.userId,
      }),
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

builder.mutationField('addConversationParticipants', (t) =>
  t.prismaField({
    type: ['AiConversationParticipant'],
    args: {
      conversationId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: false }),
      assistantIds: t.arg.stringList({ required: false }),
    },
    resolve: async (
      _query,
      _source,
      { conversationId, userIds, assistantIds },
    ) => {
      if (!userIds?.length && !assistantIds?.length) {
        throw new Error('Must provide userIds or assistantIds')
      }
      const existingParticipants =
        await prisma.aiConversationParticipant.findMany({
          where: { conversationId },
        })

      const newUsersIds = userIds?.filter(
        (userId) =>
          !existingParticipants.some(
            (participant) => participant.userId === userId,
          ),
      )
      const newAssistantIds = assistantIds?.filter(
        (assistantId) =>
          !existingParticipants.some(
            (participant) => participant.assistantId === assistantId,
          ),
      )
      return prisma.aiConversationParticipant.createManyAndReturn({
        data: [
          ...(newUsersIds || []).map((userId) => ({
            conversationId,
            userId,
          })),
          ...(newAssistantIds || []).map((assistantId) => ({
            conversationId,
            assistantId,
          })),
        ],
      })
    },
  }),
)

builder.mutationField('removeConversationParticipant', (t) =>
  t.prismaField({
    type: 'AiConversationParticipant',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }) => {
      return prisma.aiConversationParticipant.delete({
        where: { id },
      })
    },
  }),
)
