import type { Prisma } from '../../../prisma/generated/client'
import { prisma } from '../../prisma'

export const canAccessLibraryOrThrow = async (libraryId: string, userId: string) => {
  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId },
    select: {
      ownerId: true,
      participants: {
        select: { userId: true },
      },
    },
  })
  const isAuthorized =
    library.ownerId === userId || library.participants.some((participant) => participant.userId === userId)

  if (!isAuthorized) {
    throw new Error(`You do not have permission to access this library`)
  }

  return library
}

export const getAccessLibraryWhere = (userId: string): Prisma.AiLibraryWhereInput => ({
  OR: [{ ownerId: userId }, { participants: { some: { userId } } }],
})
