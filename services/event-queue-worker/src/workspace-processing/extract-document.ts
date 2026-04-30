import { transform } from '@george-ai/app-domain'
import {
  AnalyzeImageRequest,
  DocumentExtractionRequest,
  DocumentExtractionStatus,
  publish,
} from '@george-ai/event-service-client'
import { getUri } from '@george-ai/file-management'

import { WORKER_ID, logger } from '../common'

export async function extractDocument(request: DocumentExtractionRequest) {
  const { extractionMethod, documentId, workspaceId, libraryId } = request
  logger.debug('Starting document extraction', request)

  const statusEvent: DocumentExtractionStatus = {
    version: 1,
    workspaceId,
    action: 'documentExtraction',
    documentId,
    libraryId,
    extractionMethod,
    status: 'started',
    timestamp: new Date(),
    message: `Worker ${WORKER_ID} got it`,
    verb: 'status',
  }

  await publish({ ...statusEvent, timestamp: new Date(), message: `Worker ${WORKER_ID} got it`, status: 'started' })

  const extraction = await transform(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
  })

  await publish({ ...statusEvent, timestamp: new Date(), message: `source extraction finished`, status: 'progress' })

  const imageAttachments = extraction.attachments.filter(
    (att) => att.mimeType.startsWith('image/') && att.fileName.includes('_screenshot'),
  )
  if (imageAttachments.length === 0) {
    logger.debug('No screenshot attachments found, skipping image analysis provider call', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Finished without attachments`,
      status: 'finished',
    })
    return
  }

  for (const attachment of imageAttachments) {
    logger.debug('Attachment to process for image analysis', { ...attachment, uri: 'redacted' })

    const analyzeImageRequest: AnalyzeImageRequest = {
      version: 1,
      action: 'analyzeImage',
      imageUri: getUri(
        {
          workspaceId,
          libraryId,
          documentId,
          extractionMethod,
          version: 1,
          type: 'extraction',
        },
        attachment.fileName,
        {
          attachment: true,
        },
      ),
      workspaceId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      verb: 'request',
      timestamp: new Date(),
    }

    logger.debug('Publishing image analysis request for attachment', { ...analyzeImageRequest })
    await publish(analyzeImageRequest)
  }
}
