import fs from 'fs'

import { transformToMarkdown } from '@george-ai/file-converter'
import { getTimestampedMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'

import { getFileInfo } from '.'
import { prisma } from '../../prisma'

export const convertUploadToMarkdown = async (
  fileId: string,
  { fileConverterOptions }: { fileConverterOptions: string },
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
    throw new Error(`Conversion of file ${fileId} not possible: Uploaded file not found: ${uploadFilePath}`)
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
  const newConversion = await prisma.aiLibraryFileConversion.create({
    data: {
      fileId: fileRecord.id,
      libraryId: fileRecord.libraryId,
      fileName,
      success: !conversionResult.issues || Object.keys(conversionResult.issues).length === 0,
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

  return newConversion
}
