import mammoth from 'mammoth'
import { Readable } from 'stream'

import { workspaceStorage } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

// Image extracted from DOCX
interface ExtractedImage {
  filename: string
  data: Buffer
  mimeType: string
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
}

// Get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
  }
  return mimeToExt[mimeType] || 'png'
}

export async function docxToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[DOCX Converter] Starting conversion', parameters)

  const { workspaceId, libraryId, fileId } = parameters

  const readStream = await workspaceStorage.readSource(workspaceId, {
    libraryId,
    fileId,
  })

  // Mammoth only accepts path, buffer, or file - not streams
  const buffer = await streamToBuffer(readStream)

  // Collect images during conversion
  const extractedImages: ExtractedImage[] = []

  // Custom image converter that stores images for attachment
  const convertImage = mammoth.images.imgElement(
    async (image: { contentType: string; read: () => Promise<Buffer> }) => {
      const imageIndex = extractedImages.length + 1
      const extension = getExtensionFromMimeType(image.contentType)
      const filename = `image_${imageIndex}.${extension}`

      const imageData = await image.read()
      extractedImages.push({
        filename,
        data: imageData,
        mimeType: image.contentType,
      })

      // Return reference to attachment path
      return { src: `attachments/${filename}` }
    },
  )

  // @ts-expect-error - convertToMarkdown exists but not in type definitions
  const result = await mammoth.convertToMarkdown({ buffer }, { convertImage })

  const extractionWriter = await workspaceStorage.createExtraction(workspaceId, {
    libraryId,
    fileId,
    extractionMethod: 'docxExtraction',
  })

  try {
    extractionWriter.write(result.value)

    // Add extracted images as attachments
    for (const image of extractedImages) {
      extractionWriter.addAttachment(image.filename, Readable.from([image.data]), image.mimeType)
    }

    if (extractedImages.length > 0) {
      logger.debug('[DOCX Converter] Images extracted', { imageCount: extractedImages.length })
    }

    const extractionResult = await extractionWriter.finish()
    logger.debug('[DOCX Converter] Conversion completed', parameters)
    return extractionResult
  } catch (error) {
    await extractionWriter.abort(error instanceof Error ? error : undefined)
    logger.error('[DOCX Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
