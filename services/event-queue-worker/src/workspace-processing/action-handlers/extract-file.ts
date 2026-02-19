import { transform } from '@george-ai/app-domain'
import { ExtractDocumentRequest } from '@george-ai/event-service-client'

import { logger } from '../../common'

export async function extractFile(event: ExtractDocumentRequest) {
  const { extractionMethod, documentId, workspaceId, libraryId, requestType, version } = event
  logger.debug('Starting file extraction', {
    documentId,
    workspaceId,
    libraryId,
    extractionMethod,
    requestType,
    version,
  })

  const extraction = await transform(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
  })

  logger.debug('Completed file extraction', {
    documentId,
    workspaceId,
    libraryId,
    extractionMethod,
    extraction,
  })
}
