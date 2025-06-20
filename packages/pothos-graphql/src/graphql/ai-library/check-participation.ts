import { prisma } from '../../prisma'
import { LoggedInContext } from '../context'

export const canAccessLibrary = async (context: LoggedInContext, library: { id: string; ownerId: string }) => {
  const user = context.session.user

  return (
    user.isAdmin ||
    library.ownerId === user.id ||
    (await prisma.aiLibraryParticipant.findFirst({ where: { libraryId: library.id, userId: user.id } })) != null
  )
}
