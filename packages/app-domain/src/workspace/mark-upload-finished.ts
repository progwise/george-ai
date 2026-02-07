import { prisma } from '@george-ai/app-database'

export const markUploadFinished = async (workspaceId: string, options: { libraryId: string; fileId: string }) => {
  const { libraryId, fileId } = options
  const updatedFile = await prisma.aiLibraryFile.update({
    select: {
      id: true,
      name: true,
      originUri: true,
      mimeType: true,
      size: true,
      originModificationDate: true,
    },
    where: { id: fileId, libraryId, library: { workspaceId } },
    data: {
      uploadedAt: new Date(),
    },
  })

  return updatedFile
}
