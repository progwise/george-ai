import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.mutationField('addAssistantParticipants', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['User'],
    nullable: false,
    args: {
      assistantId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (query, _source, { assistantId, userIds }, { user }) => {
      const assistant = await prisma.aiAssistant.findUniqueOrThrow({
        where: { id: assistantId },
      })

      if (assistant.ownerId !== user.id) {
        throw new Error('Only the owner can add participants')
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
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    nullable: false,
    args: {
      userId: t.arg.string({ required: true }),
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { userId, assistantId }, { user }) => {
      const assistant = await prisma.aiAssistant.findUniqueOrThrow({
        where: { id: assistantId },
      })

      if (assistant.ownerId !== user.id) {
        throw new Error('Only the owner can remove participants')
      }

      const participant = await prisma.aiAssistantParticipant.findFirst({
        where: {
          userId,
          assistantId,
        },
      })

      if (!participant) {
        throw new Error('Participant not found')
      }

      await prisma.aiAssistantParticipant.delete({
        where: { id: participant.id },
      })

      return prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
    },
  }),
)
