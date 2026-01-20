import { prisma } from '../prisma'

export const getFileInfo = (parameters: { fileId: string; libraryId: string; workspaceId: string }) => {
  const { fileId, libraryId, workspaceId } = parameters

  const fileInfo = prisma?.aiLibraryFile.findFirst({
    where: {
      id: fileId,
      libraryId: libraryId,
      library: {
        workspaceId: workspaceId,
      },
    },
  })
  return fileInfo
}
