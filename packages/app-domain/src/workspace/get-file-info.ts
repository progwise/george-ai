import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'

export interface FileInfo {
  workspaceId: string
  libraryId: string
  fileId: string
  name: string
  createdAt?: Date | null
  uploadedAt?: Date | null
  mimeType: string
  size: number | null
  sourceHash: string | null
  originalUpdatedAt: Date | null
}

export const getFileInfo = async (
  workspaceId: string,
  parameters: { libraryId: string; fileId: string },
): Promise<FileInfo | null> => {
  const { libraryId, fileId } = parameters

  const [dbFile, storageFile] = await Promise.all([
    prisma.aiLibraryFile.findFirst({
      select: {
        id: true,
        name: true,
        originUri: true,
        mimeType: true,
        size: true,
        originModificationDate: true,
        originFileHash: true,
        createdAt: true,
        uploadedAt: true,
      },
      where: {
        id: fileId,
        libraryId: libraryId,
        library: {
          workspaceId: workspaceId,
        },
      },
    }),
    await workspaceStorage.getFile(workspaceId, { libraryId, fileId }),
  ])

  return {
    workspaceId,
    libraryId,
    fileId,
    name: dbFile?.name || storageFile?.fileName || 'Unknown',
    mimeType: dbFile?.mimeType || storageFile?.mimeType || 'Unknown',
    size: dbFile?.size || storageFile?.usage.sourceBytes || null,
    sourceHash: storageFile?.sourceHash || dbFile?.originFileHash || null,
    createdAt: dbFile?.createdAt,
    uploadedAt: dbFile?.uploadedAt,
    originalUpdatedAt:
      dbFile?.originModificationDate || storageFile?.originalUpdatedAt
        ? new Date(storageFile?.originalUpdatedAt || dbFile!.originModificationDate!)
        : null,
  }
}
