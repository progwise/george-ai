import fs from 'fs'

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
