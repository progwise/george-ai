import { LibraryManifest } from '../../schemas'
import { logger } from './commons'
import { getLibraryDir } from './directories'
import { exists } from './exists'
import { getLibraryManifest } from './metadata-files'

export async function getLibrary(workspaceId: string, args: { libraryId: string }): Promise<LibraryManifest | null> {
  const { libraryId } = args
  const libraryExists = await exists(workspaceId, { libraryId })
  if (!libraryExists) {
    logger.warn('Library not found', { workspaceId, libraryId })
    return null
  }
  const libraryDir = getLibraryDir(workspaceId, libraryId)
  const manifest = await getLibraryManifest(libraryDir)
  if (!manifest) {
    logger.error('Library manifest not found', { workspaceId, libraryId })
    throw new Error(`Library manifest not found for libraryId: ${libraryId} in workspaceId: ${workspaceId}`)
  }
  return manifest
}
