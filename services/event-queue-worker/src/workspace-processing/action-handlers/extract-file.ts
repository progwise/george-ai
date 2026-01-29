import { ExtractFileAction } from '@george-ai/event-service-client'
import { transformToMarkdown } from '@george-ai/file-converter'

import { logger } from '../../common'

export async function extractFile(event: ExtractFileAction) {
  const { extractionMethod, fileId, workspaceId, libraryId, actionType, version } = event
  logger.debug('Starting file extraction', {
    fileId,
    workspaceId,
    libraryId,
    extractionMethod,
    actionType,
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
