export const checkFileUpload = async (fileUploadId: string) => {
  const fileUpload = await prisma?.aiKnowledgeSourceFile.findUnique({
    where: { id: fileUploadId },
  })
  return fileUpload
}

export const completeFileUpload = async (fileUploadId: string) => {
  const fileUpload = await prisma?.aiKnowledgeSourceFile.update({
    where: { id: fileUploadId },
    data: { uploadedAt: new Date() },
  })
  return fileUpload
}

export const getFilePath = (fileId: string) =>
  `${process.env.UPLOADS_PATH}/${fileId}`
