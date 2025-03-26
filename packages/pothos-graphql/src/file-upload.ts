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

export const cleanupFile = async (fileId: string) => {
  const file = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error(`File not found: ${fileId}`)
  }

  try {
    await dropFileFromVectorstore(file.libraryId, file.id)

    await Promise.all([
      prisma?.aiLibraryFile.delete({
        where: { id: file.id },
      }),
      new Promise((resolve, reject) => {
        fs.rm(getFilePath(file.id), (err) => {
          if (err) {
            reject(`Error deleting file ${file.id}: ${err.message}`)
          } else {
            resolve(`File ${file.id} deleted`)
          }
        })
      }),
    ])

    console.log(`Successfully cleaned up file: ${fileId}`)
  } catch (error) {
    console.error(`Error cleaning up file ${fileId}:`, error)
    throw error
  }
}
