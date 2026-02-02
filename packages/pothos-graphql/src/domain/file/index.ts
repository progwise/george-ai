import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { prisma } from '../../../../app-database/src'
import { logger } from './common'

export const dropAllLibraryFiles = async (args: { workspaceId: string; libraryId: string }) => {
  const { workspaceId, libraryId } = args
  try {
    await vectorStore.removeChunks({ workspaceId, libraryId })
    await workspaceStorage.deleteFiles(workspaceId, { libraryId })
    const deletedFiles = await prisma.aiLibraryFile.deleteMany({
      where: { libraryId },
    })
    return deletedFiles.count
  } catch (error) {
    logger.error('Error deleting all library files', { libraryId, workspaceId, error })
    throw new Error(error instanceof Error ? error.message : 'Failed to delete all library files')
  }
}

export const markUploadFinished = async ({
  workspaceId,
  fileId,
  libraryId,
}: {
  workspaceId: string
  fileId: string
  libraryId: string
}) => {
  const metadata = await workspaceStorage.getFile(workspaceId, { libraryId, fileId })

  if (!metadata?.sourceHash) {
    logger.error('File does not exist when marking upload finished', { workspaceId, fileId, libraryId, metadata })
    throw new Error(
      `Cannot mark upload finished. Workspace ${workspaceId}, Library ${libraryId}, File ${fileId} does not exist`,
    )
  }

  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
    },
  })

  logger.debug('Created content extraction task for uploaded file', { workspaceId, fileId, libraryId })

  return updatedFile
}

export const deleteFile = async (args: { workspaceId: string; libraryId: string; fileId: string }) => {
  const { workspaceId, libraryId, fileId } = args

  try {
    await vectorStore.removeChunks({ workspaceId, libraryId, fileId })
    await workspaceStorage.deleteFiles(workspaceId, { libraryId, fileId })
    return await prisma.aiLibraryFile.delete({
      where: { id: fileId },
    })
  } catch (error) {
    logger.error('Error deleting file', { fileId, libraryId, error })
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        dropError: error instanceof Error ? error.message : String(error),
      },
    })
  }
}
