import { prisma } from '../../prisma'
import { LoggedInContext } from '../context'

export const canAccessLibraryOrThrow = async (context: LoggedInContext, library: { id: string; ownerId: string }) => {
  const user = context.session.user

  const isAuthorized =
    user.isAdmin ||
    library.ownerId === user.id ||
    (await prisma.aiLibraryParticipant.findFirst({ where: { libraryId: library.id, userId: user.id } })) != null
  
  if (!isAuthorized) {
    throw new Error(`You do not have permission to access this library`)
  }
}
