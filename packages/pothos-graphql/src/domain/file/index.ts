import fs from 'fs'

import { getFileDir, getUploadFilePath } from '@george-ai/file-management'
import { dropFileFromVectorstore } from '@george-ai/langchain-chat'

import { prisma } from '../../prisma'
import { canAccessLibraryOrThrow } from '../library'

export const getFileInfo = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  return fileInfo
}

export const dropFileById = async (fileId: string, userId: string) => {
  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    where: { id: fileId },
  })

  await canAccessLibraryOrThrow(file.libraryId, userId)

  try {
    const deletedFile = await deleteFile(file.id, file.libraryId)
    return { deletedFile, dropError: deletedFile.dropError }
  } catch (error) {
    const dropError = error instanceof Error ? error.message : String(error)
    console.error(`Error dropping file ${fileId}:`, dropError)
    return { ...file, dropError }
  }
}

export const dropAllLibraryFiles = async (libraryId: string, userId: string) => {
  await canAccessLibraryOrThrow(libraryId, userId)
  const filesToDelete = await prisma.aiLibraryFile.findMany({
    where: { libraryId },
  })

  const deletePromises = filesToDelete.map((file) =>
    deleteFile(file.id, libraryId).catch(async (error) => {
      const dropError = error instanceof Error ? error.message : String(error)
      return { ...file, dropError }
    }),
  )
  return await Promise.all(deletePromises)
}

export const markUploadFinished = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const uploadFilePath = getUploadFilePath({ fileId, libraryId })

  if (!fs.existsSync(uploadFilePath)) {
    throw new Error(`Cannot mark upload finished. File ${uploadFilePath} does not exist`)
  }
  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
    },
  })

  return updatedFile
}

export const deleteFile = async (fileId: string, libraryId: string) => {
  try {
    await dropFileFromVectorstore(libraryId, fileId)
    const filePathToDelete = getFileDir({ fileId, libraryId: libraryId })
    await fs.promises.rm(filePathToDelete, { recursive: true, force: true })
    return await prisma.aiLibraryFile.delete({
      where: { id: fileId },
    })
  } catch (error) {
    console.error(`Error deleting file ${fileId} in library ${libraryId}:`, error)
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
