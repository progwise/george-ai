import { promises } from 'node:fs'

import { getLibraryDir, getWorkspaceDir } from './directories'
import { getLibraryManifest } from './metadata-files'
import { workspaceUsageUpdate } from './usage-update'

const { rename } = promises

export async function moveLibrary(args: {
  libraryId: string
  fromWorkspaceId: string
  toWorkspaceId: string
}): Promise<void> {
  const { libraryId, fromWorkspaceId, toWorkspaceId } = args
  const libraryDir = await getLibraryDir(fromWorkspaceId, libraryId)
  const libraryManifest = await getLibraryManifest(libraryDir)
  if (!libraryManifest) {
    throw new Error(`Library manifest not found for library dir: ${libraryDir}`)
  }
  const toWorkspaceDir = await getWorkspaceDir(toWorkspaceId)
  const fromWorkspaceDir = await getWorkspaceDir(fromWorkspaceId)

  await rename(libraryDir, toWorkspaceDir + '/libraries/' + libraryId)

  await workspaceUsageUpdate(fromWorkspaceDir, {
    usage: libraryManifest.usage,
    operation: 'subtract',
  })

  await workspaceUsageUpdate(toWorkspaceDir, {
    usage: libraryManifest.usage,
    operation: 'add',
  })
}
