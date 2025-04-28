import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.prismaObject('AiAssistantParticipant', {
  name: 'AiAssistantParticipant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    // createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    assistantId: t.exposeID('assistantId', { nullable: false }),
    assistant: t.relation('assistant'),
    userId: t.exposeID('userId', { nullable: true }),
    user: t.relation('user'),
  }),
})

builder.mutationField('addAssistantParticipants', (t) =>
  t.prismaField({
    type: ['AiAssistantParticipant'],
    args: {
      assistantId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (query, _source, { assistantId, userIds }) => {
      const existingParticipants = await prisma.aiAssistantParticipant.findMany({
        where: { assistantId },
      })

      const newUserIds = userIds.filter(
        (userId) => !existingParticipants.some((participant) => participant.userId === userId),
      )

      return prisma.aiAssistantParticipant.createManyAndReturn({
        data: newUserIds.map((userId) => ({
          assistantId,
          userId,
        })),
      })
    },
  }),
)

builder.mutationField('removeAssistantParticipant', (t) =>
  t.prismaField({
    type: 'AiAssistantParticipant',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }) => {
      return prisma.aiAssistantParticipant.delete({
        where: { id },
      })
    },
  }),
)
