import fs from 'fs'
import path from 'node:path'

import {
  convertCsvToMarkdown,
  convertDocumentsToMarkdown,
  convertDocxToMarkdown,
  convertExcelToMarkdown,
  convertPdfToMarkdown,
  dropFileFromVectorstore,
  loadFile,
} from '@george-ai/langchain-chat'

export const checkFileUpload = async (fileUploadId: string) => {
  const fileUpload = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileUploadId },
  })
  return fileUpload
}

const getUploadsDir = () => {
  const dir = process.env.UPLOADS_PATH || './uploads'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// Path for the temporary storage of the original uploaded file
export const getTempOriginalFilePath = (fileId: string, originalFileName: string) => {
  const uploadsDir = getUploadsDir()
  const extension = originalFileName && originalFileName.includes('.') ? path.extname(originalFileName) : '.tmp'
  return `${uploadsDir}/${fileId}_original${extension}`
}

// Path for the final .md file
const getFinalMarkdownPath = (fileId: string) => {
  const uploadsDir = getUploadsDir()
  return `${uploadsDir}/${fileId}.md`
}

export const completeFileUpload = async (fileUploadId: string) => {
  const fileRecord = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileUploadId },
  })

  if (!fileRecord) {
    throw new Error(`File record not found to finish upload: ${fileUploadId}`)
  }
  if (!fileRecord.name || !fileRecord.mimeType) {
    throw new Error(`File record ${fileUploadId} is missing original name or original mimeType.`)
  }

  const originalTempFilePath = getTempOriginalFilePath(fileRecord.id, fileRecord.name)
  const finalMarkdownPath = getFinalMarkdownPath(fileRecord.id)
  let markdownContent: string

  try {
    if (!fs.existsSync(originalTempFilePath)) {
      throw new Error(`Original temporary file not found: ${originalTempFilePath}`)
    }

    // fileRecord.mimeType here is the original mime type
    switch (fileRecord.mimeType) {
      case 'application/pdf':
        markdownContent = await convertPdfToMarkdown(originalTempFilePath)
        break

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        markdownContent = await convertDocxToMarkdown(originalTempFilePath)
        break

      case 'text/csv':
        markdownContent = await convertCsvToMarkdown(originalTempFilePath)
        break

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        markdownContent = await convertExcelToMarkdown(originalTempFilePath)
        break

      default: {
        const documents = await loadFile({
          id: fileRecord.id,
          name: fileRecord.name,
          mimeType: fileRecord.mimeType,
          path: originalTempFilePath,
          originUri: fileRecord.originUri || '',
        })
        markdownContent = convertDocumentsToMarkdown(documents)
        break
      }
    }

    await fs.promises.writeFile(finalMarkdownPath, markdownContent)

    const updatedFile = await prisma?.aiLibraryFile.update({
      where: { id: fileUploadId },
      data: {
        uploadedAt: new Date(),
        mimeType: 'text/markdown',
        size: markdownContent.length,
      },
    })

    try {
      await fs.promises.unlink(originalTempFilePath)
    } catch (unlinkError) {
      console.warn(`Failed to delete original temp file ${originalTempFilePath}:`, unlinkError)
    }
    return updatedFile
  } catch (conversionError) {
    console.error(`Error processing file ${fileUploadId} (${fileRecord.name}):`, conversionError)
    try {
      if (fs.existsSync(originalTempFilePath)) {
        await fs.promises.unlink(originalTempFilePath)
      }
    } catch (unlinkError) {
      console.error(`Failed to delete original temp file ${originalTempFilePath} after conversion error:`, unlinkError)
    }
    throw new Error(
      `Failed to complete file upload and conversion for ${fileUploadId}: ${(conversionError as Error).message}`,
    )
  }
}

// getFilePath is used by dataUploadMiddleware to save the initial file
export const getFilePath = (fileId: string, originalFileName: string) => {
  return getTempOriginalFilePath(fileId, originalFileName)
}

// getProcessedFilePath returns the path to the final converted markdown file
export const getProcessedFilePath = (fileId: string) => {
  return getFinalMarkdownPath(fileId)
}

export const deleteFileAndRecord = async (fileId: string, libraryId: string) => {
  await dropFileFromVectorstore(libraryId, fileId)

  const fileRecord = await prisma?.aiLibraryFile.findUnique({ where: { id: fileId } })
  const filePathToDelete = fileRecord ? getFinalMarkdownPath(fileRecord.id) : undefined

  await Promise.all([
    prisma?.aiLibraryFile.delete({
      where: { id: fileId },
    }),
    new Promise<void>((resolve) => {
      if (filePathToDelete && fs.existsSync(filePathToDelete)) {
        fs.rm(filePathToDelete, { force: true }, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePathToDelete}: ${err.message}`)
          }
          resolve()
        })
      } else {
        console.warn(`No file path found for AiLibraryFile ${fileId} during deletion.`)
        resolve()
      }
    }),
  ])
}

export const cleanupFile = async (fileId: string) => {
  const fileRecord = await prisma?.aiLibraryFile.findUnique({
    where: { id: fileId },
  })

  if (fileRecord && !fileRecord.uploadedAt && fileRecord.name) {
    const tempPathToDelete = getTempOriginalFilePath(fileId, fileRecord.name)
    try {
      if (fs.existsSync(tempPathToDelete)) {
        await fs.promises.unlink(tempPathToDelete)
        console.log(`Successfully cleaned up (deleted) original temp file: ${tempPathToDelete}`)
      }
    } catch (error) {
      console.error(`Error cleaning up original temp file ${tempPathToDelete}:`, error)
    }
  } else if (fileRecord && fileRecord.uploadedAt) {
    console.warn(`cleanupFile called for already processed file ${fileId}. No original temp file should exist.`)
  } else {
    console.warn(`CleanupFile: Could not determine temp path for ${fileId}, record incomplete or missing.`)
  }
}
