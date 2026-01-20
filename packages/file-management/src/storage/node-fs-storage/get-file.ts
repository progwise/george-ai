import { FileManifest } from '../../schemas'
import { getFileDir } from './directories'
import { exists } from './exists'
import { getFileManifest } from './metadata-files'

export async function getFile(
  workspaceId: string,
  args: { libraryId: string; fileId: string },
): Promise<FileManifest | null> {
  const { libraryId, fileId } = args
  if (!(await exists(workspaceId, { libraryId, fileId }))) {
    return null
  }
  const libraryDir = await getFileDir(workspaceId, libraryId, fileId)
  const fileManifest = await getFileManifest(libraryDir)
  if (!fileManifest) {
    throw new Error(
      `File manifest not found for fileId: ${fileId} in libraryId: ${libraryId} and workspaceId: ${workspaceId}`,
    )
  }
  return fileManifest
}
