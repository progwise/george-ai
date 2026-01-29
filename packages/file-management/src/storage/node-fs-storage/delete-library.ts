import { getLibraryDir, getWorkspaceDir } from './directories'
import { getLibraryManifest, getWorkspaceManifest } from './metadata-files'
import { workspaceUsageUpdate } from './usage-update'

import { rm } from 'fs/promises'

export async function deleteLibrary(workspaceId: string, args: { libraryId: string }): Promise<void> {
  const { libraryId } = args
  const workspaceDir = await getWorkspaceDir(workspaceId)
  const workspaceManifest = await getWorkspaceManifest(workspaceDir)

  if (!workspaceManifest) {
    throw new Error(`Workspace manifest not found for workspaceId: ${workspaceId}`)
  }

  const libraryDir = await getLibraryDir(workspaceId, libraryId)
  const libraryManifest = await getLibraryManifest(libraryDir)

  if (!libraryManifest) {
    throw new Error(`Library manifest not found for libraryId: ${libraryId} in workspaceId: ${workspaceId}`)
  }

  await rm(libraryDir, { recursive: true, force: true })

  await workspaceUsageUpdate(workspaceDir, {
    usage: libraryManifest.usage,
    operation: 'subtract',
  })
}
