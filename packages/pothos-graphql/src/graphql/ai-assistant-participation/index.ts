import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.mutationField('addAssistantParticipants', (t) =>
  t.prismaField({
    type: ['User'],
    nullable: false,
    args: {
      ownerId: t.arg.string({ required: true }),
      assistantId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (query, _source, { ownerId, assistantId, userIds }) => {
      const assistant = await prisma.aiAssistant.findUniqueOrThrow({
        where: { id: assistantId },
        select: { ownerId: true },
      })

      if (assistant.ownerId !== ownerId) {
        throw new Error('Only the owner can add participants to this assistant')
      }

      const existingParticipants = await prisma.aiAssistantParticipant.findMany({
        where: { assistantId },
      })

      const newUserIds = userIds.filter(
        (userId) => !existingParticipants.some((participant) => participant.userId === userId),
      )

      await prisma.aiAssistantParticipant.createMany({
        data: newUserIds.map((userId) => ({
          assistantId,
          userId,
        })),
      })

      return prisma.user.findMany({
        ...query,
        where: {
          id: { in: newUserIds },
        },
      })
    },
  }),
)

builder.mutationField('removeAssistantParticipant', (t) =>
  t.prismaField({
    type: 'User',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }) => {
      const participant = await prisma.aiAssistantParticipant.findUniqueOrThrow({
        where: { id },
        select: { userId: true },
      })

      await prisma.aiAssistantParticipant.delete({
        where: { id },
      })

      return prisma.user.findUniqueOrThrow({
        where: { id: participant.userId },
      })
    },
  }),
)
