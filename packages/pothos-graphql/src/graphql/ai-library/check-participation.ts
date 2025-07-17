import { prisma } from '../../prisma'
import { LoggedInContext } from '../context'

export const canAccessLibraryOrThrow = async (context: LoggedInContext, libraryId: string) => {
  const user = context.session.user
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
    user.isAdmin ||
    library.ownerId === user.id ||
    library.participants.some((participant) => participant.userId === user.id)

  if (!isAuthorized) {
    throw new Error(`You do not have permission to access this library`)
  }
}
