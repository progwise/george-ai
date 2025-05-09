import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.mutationField('addLibraryParticipants', (t) =>
  t.prismaField({
    type: ['User'],
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (query, _source, { libraryId, userIds }) => {
      const existingParticipants = await prisma.aiLibraryParticipant.findMany({
        where: { libraryId },
      })

      const newUserIds = userIds.filter(
        (userId) => !existingParticipants.some((participant) => participant.userId === userId),
      )

      await prisma.aiLibraryParticipant.createMany({
        data: newUserIds.map((userId) => ({
          libraryId,
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

builder.mutationField('removeLibraryParticipant', (t) =>
  t.prismaField({
    type: 'User',
    nullable: false,
    args: {
      userId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { userId, libraryId }) => {
      const participant = await prisma.aiLibraryParticipant.findFirst({
        where: {
          userId,
          libraryId,
        },
      })

      if (!participant) {
        throw new Error('Participant not found')
      }

      await prisma.aiLibraryParticipant.delete({
        where: { id: participant.id },
      })

      return prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
    },
  }),
)
