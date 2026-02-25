import { prisma } from '@george-ai/app-database'
import { LibraryManifest, createLibrary, existsWorkspace, getLibrary } from '@george-ai/file-management'

import { logger } from '../common'
import { fixMissingWorkspaceManifest } from '../workspace/fix-missing-workspace-manifest'

export async function fixMissingLibraryManifest(libraryId: string): Promise<LibraryManifest> {
  const library = await prisma.aiLibrary.findFirstOrThrow({
    where: { id: libraryId },
  })

  const manifest = await getLibrary(library.workspaceId, { libraryId: library.id })
  if (manifest) {
    return manifest
  }

  const workspaceExists = await existsWorkspace(library.workspaceId)
  if (!workspaceExists) {
    await fixMissingWorkspaceManifest(library.workspaceId)
  }

  logger.warn('Fixing missing library manifest', { libraryId, library })

  const newManifest = await createLibrary(library.workspaceId, {
    libraryId: library.id,
    name: library.name,
    creator: `fix:missing:library:manifest:${library.id}`,
  })

  return newManifest
}
