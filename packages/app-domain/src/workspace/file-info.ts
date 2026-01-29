import { prisma } from '../prisma'

/**
 *
 * @param parameters @deprecated
 * @return File Info from database.
 */
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
