import fs from 'fs'

import { prisma } from '@george-ai/app-domain'
import { getUploadFilePath, workspaceStorage } from '@george-ai/file-management'
import { vectorStoreClient } from '@george-ai/vector-store-client'

import { createContentProcessingTask } from '../content-extraction/content-extraction-task'
import { logger } from './common'

export const dropAllLibraryFiles = async (args: { workspaceId: string; libraryId: string }) => {
  const { workspaceId, libraryId } = args

  try {
    await vectorStoreClient.removeDocuments(workspaceId, { libraryId })
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

export const markUploadFinished = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const uploadFilePath = getUploadFilePath({ fileId, libraryId })

  if (!fs.existsSync(uploadFilePath)) {
    logger.error('File does not exist when marking upload finished', { fileId, libraryId, uploadFilePath })
    throw new Error(`Cannot mark upload finished. File ${uploadFilePath} does not exist`)
  }
  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
    },
  })

  // Always create content extraction task for uploaded file
  // Text extraction is always enabled by default
  await createContentProcessingTask({
    fileId,
    libraryId,
  })
  logger.info('Created content extraction task for uploaded file', { fileId, libraryId })

  return updatedFile
}

export const deleteFile = async (args: { workspaceId: string; libraryId: string; fileId: string }) => {
  const { workspaceId, libraryId, fileId } = args

  try {
    await vectorStoreClient.removeDocuments(workspaceId, { libraryId, fileId })
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

export const deletePreparedFile = async (args: { workspaceId: string; libraryId: string; fileId: string }) => {
  const { workspaceId, libraryId, fileId } = args

  try {
    const chunkCount = await vectorStoreClient.chunkCount(workspaceId, { libraryId, fileId })
    if (chunkCount > 0) {
      throw new Error(`Cannot delete prepared file ${fileId} that has already ${chunkCount} chunks`)
    }
    const fileExists = await workspaceStorage.exists(workspaceId, {
      libraryId,
      fileId,
    })
    if (fileExists) {
      await workspaceStorage.deleteFiles(workspaceId, { libraryId, fileId })
    }
    return await prisma.aiLibraryFile.delete({
      where: { id: fileId },
    })
  } catch (error) {
    logger.error('Error deleting prepared file', { fileId, libraryId, error })
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        dropError: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

export const getMimeTypeForFile = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findFirstOrThrow({ where: { id: fileId } })
  return fileInfo.mimeType
}
