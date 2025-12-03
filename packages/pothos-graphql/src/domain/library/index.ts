import type { Prisma } from '../../../prisma/generated/client'
import { prisma } from '../../prisma'

/**
 * Check if user can access a library.
 * Access is granted if the user is a member of the workspace that owns the library.
 */
export const canAccessLibraryOrThrow = async (libraryId: string, userId: string) => {
  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId },
    select: {
      ownerId: true,
      workspaceId: true,
    },
  })

  // Check if user is a member of the library's workspace
  const isMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: library.workspaceId,
      userId,
    },
  })

  if (!isMember) {
    throw new Error(`You do not have permission to access this library`)
  }

  return library
}

/**
 * Check if user is the owner of a library (for delete operations).
 */
export const isLibraryOwnerOrThrow = async (libraryId: string, userId: string) => {
  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId },
    select: {
      ownerId: true,
    },
  })

  if (library.ownerId !== userId) {
    throw new Error(`Only the owner can delete this library`)
  }

  return library
}

export const getAccessLibraryWhere = (workspaceId: string): Prisma.AiLibraryWhereInput => ({
  workspaceId,
})
