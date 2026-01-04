import { rename } from 'node:fs/promises'

import { getLibraryDir, getWorkspaceDir } from './directories'
import { getLibraryManifest } from './metadata-files'
import { workspaceSizeUpdate } from './size-update'

export async function moveLibrary(libraryId: string, fromWorkspaceId: string, toWorkspaceId: string): Promise<void> {
  const libraryDir = await getLibraryDir(fromWorkspaceId, libraryId)
  const libraryManifest = await getLibraryManifest(libraryDir)
  const toWorkspaceDir = await getWorkspaceDir(toWorkspaceId)
  const fromWorkspaceDir = await getWorkspaceDir(fromWorkspaceId)

  await rename(libraryDir, toWorkspaceDir + '/libraries/' + libraryId)

  await workspaceSizeUpdate(fromWorkspaceDir, {
    bytes: -libraryManifest.usage.activeBytes,
    files: -libraryManifest.usage.totalFileCount,
  })

  await workspaceSizeUpdate(toWorkspaceDir, {
    bytes: libraryManifest.usage.activeBytes,
    files: libraryManifest.usage.totalFileCount,
  })
}
