import domain from '@george-ai/app-domain'
import { DocumentVectorizationRequest, DocumentVectorizationStatus, publish } from '@george-ai/event-service-client'

import { WORKER_ID, logger } from '../common'

export async function vectorizeDocument(event: DocumentVectorizationRequest) {
  logger.debug('vectorizeDocument', event)

  const { extractionMethod, documentId, workspaceId, libraryId, embeddingDriver, embeddingModel } = event
  const statusEvent: DocumentVectorizationStatus = {
    version: 1,
    workspaceId,
    documentId,
    libraryId,
    extractionMethod,
    status: 'started',
    timestamp: new Date(),
    message: `Worker ${WORKER_ID} got it`,
    verb: 'status',
    action: 'documentVectorization',
    splitMethod: 'standard',
    embeddingDriver,
    embeddingModel,
  }

  await publish({ ...statusEvent, timestamp: new Date(), message: `Worker ${WORKER_ID} got it`, status: 'started' })

  try {
    await domain.document.vectorize({
      documentId,
      libraryId,
      workspaceId,
      extractionMethod,
      embeddingDriver,
      embeddingModel,
    })
  } catch (error) {
    logger.error('Error vectorizing document', {
      error,
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
      embeddingDriver,
      embeddingModel,
    })
    await publish({
      ...statusEvent,
      timestamp: new Date(),
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failure',
    })
  }
}
