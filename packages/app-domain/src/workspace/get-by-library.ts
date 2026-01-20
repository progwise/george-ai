import { prisma } from '../prisma'

export const getWorkspaceIdFromLibrary = async (parameters: { libraryId: string }) => {
  const { libraryId } = parameters
  const library = await prisma.aiLibrary.findFirstOrThrow({
    where: { id: libraryId },
    select: { workspaceId: true },
  })
  return library.workspaceId
}
