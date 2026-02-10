import { prisma } from '@george-ai/app-database'

export async function getFileInfo(workspaceId: string, parameters: { libraryId: string; fileId: string }) {
  const file = await prisma.aiLibraryFile.findFirst({
    where: {
      id: parameters.fileId,
      libraryId: parameters.libraryId,
      library: {
        workspaceId,
      },
    },
    select: {
      id: true,
      libraryId: true,
      name: true,
      mimeType: true,
      createdAt: true,
      updatedAt: true,
      uploadedAt: true,
      originFileHash: true,
      originModificationDate: true,
    },
  })

  return file
}
