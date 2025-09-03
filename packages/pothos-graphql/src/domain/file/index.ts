import fs from 'fs'

import { deleteFileDir, fileDirIsEmpty, getFileDir, getLibraryDir, getUploadFilePath } from '@george-ai/file-management'
import { dropFileFromVectorstore, dropVectorStore, getFileChunkCount } from '@george-ai/langchain-chat'
import Prisma from '@george-ai/prismaClient'

import { prisma } from '../../prisma'
import { canAccessLibraryOrThrow } from '../library'

export type File = Prisma.AiLibraryFile

export const canAccessFileOrThrow = async (fileId: string, userId: string) => {
  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    include: { library: { select: { embeddingModelName: true } } },
    where: { id: fileId },
  })
  await canAccessLibraryOrThrow(file.libraryId, userId)
  return file
}

export const getFileInfo = async (fileId: string, userId: string) => {
  const fileInfo = await canAccessFileOrThrow(fileId, userId)
  return fileInfo
}

export const deleteLibraryFiles = async (libraryId: string, userId: string) => {
  await canAccessLibraryOrThrow(libraryId, userId)

  try {
    await dropVectorStore(libraryId)
    const libraryPathToDelete = getLibraryDir(libraryId)
    await fs.promises.rm(libraryPathToDelete, { recursive: true, force: true })
    const deletedFiles = await prisma.aiLibraryFile.deleteMany({
      where: { libraryId },
    })
    return deletedFiles.count
  } catch (error) {
    console.error(`Error deleting all library files for library ${libraryId}:`, error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete all library files')
  }
}

export const markUploadFinished = async ({
  fileId,
  libraryId,
  userId,
}: {
  fileId: string
  libraryId: string
  userId: string
}) => {
  await canAccessFileOrThrow(fileId, userId)
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

export const deleteFile = async (fileId: string, userId: string) => {
  const file = await canAccessFileOrThrow(fileId, userId)

  try {
    await dropFileFromVectorstore(file.libraryId, fileId)
    const filePathToDelete = getFileDir({ fileId, libraryId: file.libraryId })
    await fs.promises.rm(filePathToDelete, { recursive: true, force: true })
    return await prisma.aiLibraryFile.delete({
      where: { id: fileId },
    })
  } catch (error) {
    console.error(`Error deleting file ${fileId} in library ${file.libraryId}:`, error)
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        dropError: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

export const deletePreparedFile = async (fileId: string, userId: string) => {
  const file = await canAccessFileOrThrow(fileId, userId)

  try {
    const chunkCount = await getFileChunkCount(file.libraryId, fileId)
    if (chunkCount > 0) {
      throw new Error(`Cannot delete prepared file ${fileId} that has already ${chunkCount} chunks`)
    }
    const fileDirExists = await fileDirIsEmpty(fileId, file.libraryId)
    if (fileDirExists) {
      await deleteFileDir(fileId, file.libraryId)
    }
    return await prisma.aiLibraryFile.delete({
      where: { id: fileId },
    })
  } catch (error) {
    console.error(`Error deleting file ${fileId} in library ${file.libraryId}:`, error)
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        dropError: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

export const getMimeTypeForFile = async (fileId: string, userId: string) => {
  await canAccessFileOrThrow(fileId, userId)

  const fileInfo = await prisma.aiLibraryFile.findFirstOrThrow({ where: { id: fileId } })
  return fileInfo.mimeType
}
