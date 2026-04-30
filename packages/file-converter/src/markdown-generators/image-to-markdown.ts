import { createExtraction, getUri, readSource } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

export async function imageToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[Attachments Converter] Starting conversion', parameters)

  // For images, we can simply return a markdown string with the image URL
  const { document, timeoutSignal } = parameters

  const { fileSize, stream } = await readSource(document)

  const extractionWriter = await createExtraction(document, 'imageExtraction')

  try {
    extractionWriter.write(`# Image extraction for (${document.name})

    Summary file for image document with the following details:
  
    - Document ID: ${document.documentId}
    - Workspace ID: ${document.workspaceId}
    - Library ID: ${document.libraryId}
    - MIME Type: ${document.mimeType}
    - Source URI: ${getUri(document)}
    - File size: ${fileSize}
    - Image Hash: ${document.sourceHash} 

  `)

    // Adding the image as attachment will trigger the event consumer to generate the markdown
    extractionWriter.addAttachment(document.name, stream, document.mimeType)
    timeoutSignal.throwIfAborted()
    const result = await extractionWriter.ack()
    logger.debug('[Attachments Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[Attachments Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
