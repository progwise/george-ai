import { getExtractionDir, getFileDir, getLibraryDir, getWorkspaceDir } from './directories'

export async function exists(
  workspaceId: string,
  args: {
    libraryId?: string
    fileId?: string
    methodId?: string
  },
): Promise<boolean> {
  const { libraryId, fileId, methodId } = args

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

  if (!methodId)
    try {
      await getFileDir(workspaceId, libraryId, fileId)
      return true
    } catch {
      return false
    }

  try {
    await getExtractionDir(workspaceId, libraryId, fileId, methodId)
    return true
  } catch {
    return false
  }
}
