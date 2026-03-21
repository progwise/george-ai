import { ExtractionMethod } from '@george-ai/app-schema'
import { transformToMarkdown } from '@george-ai/file-converter'
import { ExtractionManifest, getDocumentOrThrow } from '@george-ai/file-management'

import { logger } from '../common'

export async function transform(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentId: string
    extractionMethod: ExtractionMethod
  },
): Promise<ExtractionManifest> {
  const { libraryId, documentId, extractionMethod } = parameters

  const document = await getDocumentOrThrow({ workspaceId, libraryId, documentId })

  logger.info('Transforming', { workspaceId, parameters, document })

  return await transformToMarkdown({
    document,
    timeoutSignal: new AbortController().signal,
    options: {
      extractionMethod,
    },
  })
}
