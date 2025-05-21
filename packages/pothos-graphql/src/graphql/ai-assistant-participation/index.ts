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
    resolve: async (query, _source, { assistantId, userIds }, context) => {
      const assistant = await prisma.aiAssistant.findUniqueOrThrow({
        where: { id: assistantId },
      })

      if (assistant.ownerId !== context.session.user.id) {
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
      assistantId: t.arg.string({ required: true }),
      userId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { assistantId, userId }, context) => {
      const assistant = await prisma.aiAssistant.findUniqueOrThrow({
        where: { id: assistantId },
      })

      if (assistant.ownerId !== context.session.user.id) {
        throw new Error('Only the owner can remove participants')
      }

      await prisma.aiAssistantParticipant.deleteMany({
        where: {
          userId,
          assistantId,
        },
      })

      return prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
    },
  }),
)

builder.mutationField('leaveAssistantParticipant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { assistantId }, context) => {
      await prisma.aiAssistantParticipant.deleteMany({
        where: {
          assistantId,
        },
      })

      return prisma.user.findUniqueOrThrow({
        where: { id: context.session.user.id },
      })
    },
  }),
)
