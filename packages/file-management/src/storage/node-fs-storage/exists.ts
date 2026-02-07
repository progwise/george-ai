import { ExtractionMethod } from '@george-ai/app-commons'

import { getExtractionDir, getFileDir, getLibraryDir, getWorkspaceDir } from './directories'

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
    try {
      await getWorkspaceDir(workspaceId)
      return true
    } catch {
      return false
    }
  }

  if (!fileId) {
    try {
      await getLibraryDir(workspaceId, libraryId)
      return true
    } catch {
      return false
    }
  }

  if (!extractionMethod)
    try {
      await getFileDir(workspaceId, libraryId, fileId)
      return true
    } catch {
      return false
    }

  try {
    await getExtractionDir(workspaceId, libraryId, fileId, extractionMethod)
    return true
  } catch {
    return false
  }
}
