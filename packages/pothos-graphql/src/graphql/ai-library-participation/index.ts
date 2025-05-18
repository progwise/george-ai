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
      currentUserId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId, libraryId, currentUserId }) => {
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        where: { id: libraryId },
      })

      if (library.ownerId !== currentUserId) {
        throw new Error('Only the owner can remove participants')
      }

      await prisma.aiLibraryParticipant.delete({
        where: {
          libraryId_userId: { userId, libraryId },
        },
      })

      return prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: userId },
      })
    },
  }),
)
