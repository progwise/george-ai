import { workspaceStorage } from '@george-ai/file-management'

export async function getSourceFileHash(parameters: { workspaceId: string; libraryId: string; fileId: string }) {
  const { fileId, workspaceId, libraryId } = parameters

  const fileManifest = await workspaceStorage.getFile(workspaceId, { libraryId, fileId })

  if (!fileManifest) {
    return null
  }
  return fileManifest.sourceHash
}
