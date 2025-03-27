import fs from 'fs'

import { dropFileFromVectorstore } from '@george-ai/langchain-chat'

export const checkFileUpload = async (fileUploadId: string) => {
  const fileUpload = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileUploadId },
  })
  return fileUpload
}

export const completeFileUpload = async (fileUploadId: string) => {
  const fileUpload = await prisma?.aiLibraryFile.update({
    where: { id: fileUploadId },
    data: { uploadedAt: new Date() },
  })
  return fileUpload
}

export const getFilePath = (fileId: string) => {
  const path = `${process.env.UPLOADS_PATH}`

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }

  return `${path}/${fileId}`
}

export const deleteFileAndRecord = async (fileId: string, libraryId: string) => {
  await dropFileFromVectorstore(libraryId, fileId)

  await Promise.all([
    prisma?.aiLibraryFile.delete({
      where: { id: fileId },
    }),
    new Promise((resolve, reject) => {
      fs.rm(getFilePath(fileId), (err) => {
        if (err) {
          reject(`Error deleting file ${fileId}: ${err.message}`)
        } else {
          resolve(`File ${fileId} deleted`)
        }
      })
    }),
  ])
}

export const cleanupFile = async (fileId: string) => {
  const file = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error(`File not found: ${fileId}`)
  }

  try {
    await deleteFileAndRecord(file.id, file.libraryId)
    console.log(`Successfully cleaned up file: ${fileId}`)
  } catch (error) {
    console.error(`Error cleaning up file ${fileId}:`, error)
    throw error
  }
}

export const checkAssistant = async (assistantId: string) => {
  const assistant = await prisma?.aiAssistant.findUnique({
    where: { id: assistantId },
  })
  return assistant
}

export const getAssistantIconsPath = () => {
  const path = `${process.env.UPLOADS_PATH}/assistant-icons`

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }

  return `${path}`
}

export const updateAssistantIconUrl = async ({ assistantId, iconUrl }: { assistantId: string; iconUrl: string }) => {
  const assistant = await prisma?.aiAssistant.update({
    where: { id: assistantId },
    data: { iconUrl },
  })
  return assistant
}
