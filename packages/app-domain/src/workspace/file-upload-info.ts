import { prisma } from '../prisma'

export const getUploadFileInfo = (parameters: { workspaceId: string; uploadToken: string }) => {
  const { uploadToken, workspaceId } = parameters

  const fileInfo = prisma?.aiLibraryFile.findFirst({
    where: {
      id: uploadToken,
      library: {
        workspaceId: workspaceId,
      },
    },
  })
  return fileInfo
}

export const markUploadFinished = async ({ fileId }: { fileId: string }) => {
  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
    },
  })

  return updatedFile
}
