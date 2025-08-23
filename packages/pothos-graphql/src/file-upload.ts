import fs from 'fs'

import { transformToMarkdown } from '@george-ai/file-converter'
import { getFileDir, getTimestampedMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { dropFileFromVectorstore } from '@george-ai/langchain-chat'

import { prisma } from './prisma'

export const getFileInfo = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  return fileInfo
}

export const convertUploadToMarkdown = async (
  fileId: string,
  { removeUploadFile, fileConverterOptions }: { removeUploadFile: boolean; fileConverterOptions: string },
) => {
  const fileRecord = await getFileInfo(fileId)
  if (!fileRecord) {
    throw new Error(`File record not found for ID: ${fileId}`)
  }
  if (!fileRecord.name || !fileRecord.mimeType) {
    throw new Error(`File record ${fileId} is missing original name or mimeType.`)
  }

  const uploadFilePath = getUploadFilePath({ fileId: fileRecord.id, libraryId: fileRecord.libraryId })

  if (!fs.existsSync(uploadFilePath)) {
    throw new Error(`Uploaded file not found: ${uploadFilePath}`)
  }

  const startTime = Date.now()

  // Convert file using new result structure
  const conversionResult = await transformToMarkdown({
    name: fileRecord.name,
    mimeType: fileRecord.mimeType,
    path: uploadFilePath,
    fileConverterOptions,
  })

  const processingTime = Date.now() - startTime

  // Generate timestamped filename
  const { filePath: timestampedFilePath, fileName } = getTimestampedMarkdownFilePath({
    fileId: fileRecord.id,
    libraryId: fileRecord.libraryId,
  })

  // Write content to timestamped file
  await fs.promises.writeFile(timestampedFilePath, conversionResult.content, {
    encoding: 'utf-8',
  })

  // Save conversion attempt to database
  await prisma.aiFileConversionAttempt.create({
    data: {
      fileId: fileRecord.id,
      fileName,
      success: !conversionResult.issues || Object.keys(conversionResult.issues).length === 0,
      hasEndlessLoop: conversionResult.issues?.endlessLoop || false,
      hasTimeout: conversionResult.issues?.timeout || false,
      hasPartialResult: conversionResult.issues?.partialResult || false,
      hasUnsupportedFormat: conversionResult.issues?.unsupportedFormat || false,
      hasConversionError: conversionResult.issues?.conversionError || false,
      hasLegacyFormat: conversionResult.issues?.legacyFormat || false,
      metadata: conversionResult.metadata ? JSON.stringify(conversionResult.metadata) : null,
      fileConverterOptions,
      processingTimeMs: processingTime,
    },
  })

  if (removeUploadFile) {
    await fs.promises.rm(uploadFilePath, { force: true })
  }

  return {
    success: !conversionResult.issues || Object.keys(conversionResult.issues).length === 0,
    fileName,
    issues: conversionResult.issues,
  }
}

export const markUploadFinished = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  // Get the latest successful conversion attempt from database
  const latestSuccessfulAttempt = await prisma.aiFileConversionAttempt.findFirst({
    where: {
      fileId,
      success: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!latestSuccessfulAttempt) {
    // If no successful conversion exists, try to get the latest attempt anyway
    const latestAttempt = await prisma.aiFileConversionAttempt.findFirst({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestAttempt) {
      throw new Error(`No conversion attempts found for file ${fileId}`)
    }

    // Use the latest attempt even if it wasn't successful
    const fileDir = getFileDir({ fileId, libraryId })
    const timestampedFilePath = `${fileDir}/${latestAttempt.fileName}`
    
    if (!fs.existsSync(timestampedFilePath)) {
      throw new Error(`Converted file not found: ${timestampedFilePath}`)
    }
    
    const convertedFileSize = fs.statSync(timestampedFilePath).size
    const updatedFile = await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        uploadedAt: new Date(),
        size: convertedFileSize,
      },
    })

    return updatedFile
  }

  // Use the latest successful conversion
  const fileDir = getFileDir({ fileId, libraryId })
  const timestampedFilePath = `${fileDir}/${latestSuccessfulAttempt.fileName}`
  
  if (!fs.existsSync(timestampedFilePath)) {
    throw new Error(`Converted file not found: ${timestampedFilePath}`)
  }
  
  const convertedFileSize = fs.statSync(timestampedFilePath).size
  const updatedFile = await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      uploadedAt: new Date(),
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

export const getMimeTypeForFile = async (fileId: string) => {
  const fileInfo = await prisma.aiLibraryFile.findFirstOrThrow({ where: { id: fileId } })
  return fileInfo.mimeType
}
