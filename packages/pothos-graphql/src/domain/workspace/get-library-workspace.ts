import { prisma } from '../../prisma'

/**
 * Get the workspace ID for a library (used for API key authentication)
 *
 * @param libraryId - The library ID
 * @returns Workspace ID or undefined if library not found
 */
export async function getLibraryWorkspace(libraryId: string): Promise<string | undefined> {
  const library = await prisma.aiLibrary.findFirstOrThrow({
    where: { id: libraryId },
    select: { workspaceId: true },
  })

  return library.workspaceId
}
