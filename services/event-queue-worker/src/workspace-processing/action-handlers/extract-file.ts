import { ExtractFileRequest } from '@george-ai/event-service-client'
import { transformToMarkdown } from '@george-ai/file-converter'

import { logger } from '../../common'

export async function extractFile(event: ExtractFileRequest) {
  const { extractionMethod, fileId, workspaceId, libraryId, requestType, version } = event
  logger.debug('Starting file extraction', {
    fileId,
    workspaceId,
    libraryId,
    extractionMethod,
    requestType,
    version,
  })

  const extraction = await transformToMarkdown({
    workspaceId,
    libraryId,
    fileId,
    timeoutSignal: new AbortController().signal,
    options: {
      extractionMethod,
    },
  })

  logger.debug('Completed file extraction', {
    fileId,
    workspaceId,
    libraryId,
    extractionMethod,
    extraction,
  })
}
