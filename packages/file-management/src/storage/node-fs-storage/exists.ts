import { ExtractionMethod } from '@george-ai/app-commons'

import { existsDir, getExtractionDir, getFileDir, getLibraryDir, getWorkspaceDir } from './directories'

export async function exists(
  workspaceId: string,
  args: {
    libraryId?: string
    fileId?: string | null
    extractionMethod?: ExtractionMethod
  },
): Promise<boolean> {
  const { libraryId, fileId, extractionMethod } = args

  if (!libraryId) {
    return await existsDir(getWorkspaceDir(workspaceId))
  }

  if (!fileId) {
    return await existsDir(getLibraryDir(workspaceId, libraryId))
  }

  if (!extractionMethod) {
    return await existsDir(getFileDir(workspaceId, libraryId, fileId))
  }

  return await existsDir(getExtractionDir(workspaceId, libraryId, fileId, extractionMethod))
}
