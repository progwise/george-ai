import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'

export async function upgradeFromLegacy(parameters: { workspaceId: string; libraryId: string }): Promise<boolean> {
  const { workspaceId, libraryId } = parameters
  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId },
    include: { workspace: true },
  })
  await workspaceStorage.upgradeLegacyLibrary(workspaceId, {
    libraryId,
    libraryName: library.name,
    workspaceName: library.workspace.name,
    fileInfoLoader: async (fileId) => {
      const file = await prisma.aiLibraryFile.findUnique({ where: { id: fileId } })
      if (!file) {
        throw new Error('File not found')
      }
      return {
        workspaceId,
        libraryId,
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        createdAt: file.createdAt.toISOString(),
        uploadedAt: file.uploadedAt?.toISOString(),
        hash: file.originFileHash,
      }
    },
  })
  return true
}
