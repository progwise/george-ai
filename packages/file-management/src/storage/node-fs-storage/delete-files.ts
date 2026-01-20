import path from 'node:path'

import { getFileDir, getFilesDir, getLibraryDir } from './directories'
import { getFileManifest, getLibraryManifest } from './metadata-files'
import { libraryUsageUpdate } from './usage-update'

import { lstat, readdir, rm } from 'fs/promises'

export async function deleteFiles(
  workspaceId: string,
  selector: { libraryId: string; fileId?: string },
): Promise<void> {
  const { libraryId, fileId } = selector
  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  if (fileId) {
    const fileDir = await getFileDir(workspaceId, libraryId, fileId)
    const metadata = await getFileManifest(fileDir)
    if (!metadata) {
      throw new Error(
        `File manifest not found for fileId: ${fileId} in libraryId: ${libraryId} and workspaceId: ${workspaceId}`,
      )
    }
    await rm(fileDir, { recursive: true, force: true })
    await libraryUsageUpdate(libraryDir, {
      usage: metadata.usage,
      operation: 'subtract',
    })
    return
  }

  const filesDir = await getFilesDir(workspaceId, libraryId)

  const dirContent = await readdir(filesDir)
  await Promise.all(
    dirContent.map(async (dirItem) => {
      const item = await lstat(path.join(filesDir, dirItem))
      if (item.isDirectory()) {
        return rm(path.join(filesDir, dirItem), { recursive: true, force: true })
      }
      return Promise.resolve()
    }),
  )

  const manifest = await getLibraryManifest(libraryDir)

  if (!manifest) {
    throw new Error(`Library manifest not found for libraryId: ${libraryId} in workspaceId: ${workspaceId}`)
  }

  await libraryUsageUpdate(libraryDir, {
    usage: manifest.usage,
    operation: 'subtract',
  })
}
