import fs from 'fs'

import { transformToMarkdown } from '@george-ai/file-converter'
import { dropFileFromVectorstore } from '@george-ai/langchain-chat'

import { prisma } from './prisma'

export const getFileInfo = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  return fileInfo
}

export const getUploadsDir = () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const getLibraryDir = (libraryId: string) => {
  const uploadsDir = getUploadsDir()
  const libraryDir = `${uploadsDir}/${libraryId}`
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true })
  }
  return libraryDir
}

export const getFileDir = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const libraryDir = getLibraryDir(libraryId)
  const fileDir = `${libraryDir}/${fileId}`
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }
  return fileDir
}

export const getUploadFilePAth = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  return `${fileDir}/upload`
}

export const getMarkdownFilePath = ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  return `${fileDir}/converted.md`
}

export const convertUploadToMarkdown = async (fileId: string, { removeUploadFile }: { removeUploadFile: boolean }) => {
  const fileRecord = await getFileInfo(fileId)
  if (!fileRecord) {
    throw new Error(`File record not found for ID: ${fileId}`)
  }
  if (!fileRecord.name || !fileRecord.mimeType) {
    throw new Error(`File record ${fileId} is missing original name or mimeType.`)
  }

  const fileDir = getFileDir({ fileId: fileRecord.id, libraryId: fileRecord.libraryId })
  const uploadFilePath = getUploadFilePAth({ fileId: fileRecord.id, libraryId: fileRecord.libraryId })

  if (!fs.existsSync(uploadFilePath)) {
    throw new Error(`Uploaded file not found: ${uploadFilePath}`)
  }

  const markdownContent = await transformToMarkdown({
    name: fileRecord.name,
    mimeType: fileRecord.mimeType,
    path: uploadFilePath,
  })

  await fs.promises.writeFile(`${fileDir}/converted.md`, markdownContent, {
    encoding: 'utf-8',
  })
  if (removeUploadFile) {
    await fs.promises.rm(`${fileDir}/upload`, { force: true })
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
