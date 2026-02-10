import { FileManifest } from '../../schemas'
import { logger } from './commons'
import { getFileDir } from './directories'
import { exists } from './exists'
import { getFileManifest } from './metadata-files'

export async function getFile(
  workspaceId: string,
  args: { libraryId: string; fileId: string },
): Promise<FileManifest | null> {
  const { libraryId, fileId } = args
  const fileExists = await exists(workspaceId, { libraryId, fileId })
  if (!fileExists) {
    logger.warn('File not found', { workspaceId, libraryId, fileId })
    return null
  }
  logger.debug('Getting file', { workspaceId, libraryId, fileId })
  const fileDir = getFileDir(workspaceId, libraryId, fileId)
  const manifest = await getFileManifest(fileDir)
  if (!manifest) {
    logger.error('File manifest not found', { workspaceId, libraryId, fileId })
    throw new Error(
      `File manifest not found for fileId: ${fileId}, libraryId: ${libraryId} in workspaceId: ${workspaceId}`,
    )
  }
  return manifest
}
