import fs from 'fs'

import { transformToMarkdown } from '@george-ai/file-converter'
import { getFileDir, getMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { dropFileFromVectorstore } from '@george-ai/langchain-chat'

import { prisma } from './prisma'

export const getFileInfo = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  return fileInfo
}

export const convertUploadToMarkdown = async (fileId: string, { removeUploadFile }: { removeUploadFile: boolean }) => {
  const fileRecord = await getFileInfo(fileId)
  if (!fileRecord) {
    throw new Error(`File record not found for ID: ${fileId}`)
  }
  if (!fileRecord.name || !fileRecord.mimeType) {
    throw new Error(`File record ${fileId} is missing original name or mimeType.`)
  }

  const markdownFilePath = getMarkdownFilePath({ fileId: fileRecord.id, libraryId: fileRecord.libraryId })
  const uploadFilePath = getUploadFilePath({ fileId: fileRecord.id, libraryId: fileRecord.libraryId })

  if (!fs.existsSync(uploadFilePath)) {
    throw new Error(`Uploaded file not found: ${uploadFilePath}`)
  }

  const markdownContent = await transformToMarkdown({
    name: fileRecord.name,
    mimeType: fileRecord.mimeType,
    path: uploadFilePath,
  })

  await fs.promises.writeFile(markdownFilePath, markdownContent, {
    encoding: 'utf-8',
  })
  if (removeUploadFile) {
    await fs.promises.rm(uploadFilePath, { force: true })
  }
}

export const markUploadFinished = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const convertedFilePath = getMarkdownFilePath({ fileId, libraryId })
  const convertedFileSize = fs.statSync(convertedFilePath).size
  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
      mimeType: 'text/markdown',
      size: convertedFileSize,
    },
  })

  return updatedFile
}

export const deleteFile = async (fileId: string, libraryId: string) => {
  await dropFileFromVectorstore(libraryId, fileId)

  const fileRecord = await prisma.aiLibraryFile.findFirstOrThrow({ where: { id: fileId } })
  const filePathToDelete = getFileDir({ fileId, libraryId: fileRecord.libraryId })

  await fs.promises.rm(filePathToDelete, { recursive: true, force: true })
  await prisma.aiLibraryFile.delete({
    where: { id: fileId },
  })
}

export const checkUser = async (userId: string) => {
  const user = await prisma?.user.findUnique({
    where: { id: userId },
  })
  return user
}

export const getUserAvatarsPath = () => {
  const path = `${process.env.UPLOADS_PATH}/user-avatars`

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }

  return `${path}`
}

export const updateUserAvatarUrl = async ({ userId, avatarUrl }: { userId: string; avatarUrl: string | null }) => {
  const user = await prisma?.user.update({
    where: { id: userId },
    data: { avatarUrl },
  })
  return user
}
