import { getFileDir, getLibraryDir } from './directories'
import { getFileManifest } from './metadata-files'
import { librarySizeUpdate } from './size-update'

import { rm } from 'fs/promises'

export async function deleteFile(workspaceId: string, libraryId: string, fileId: string): Promise<void> {
  const fileDir = await getFileDir(workspaceId, libraryId, fileId)
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  const metadata = await getFileManifest(fileDir)
  // Delete the file directory and all its contents recursively
  await rm(fileDir, { recursive: true, force: true })

  librarySizeUpdate(libraryDir, { bytes: -metadata.usage.activeBytes, files: -1 })
}
