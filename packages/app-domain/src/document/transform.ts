import { ExtractionMethod } from '@george-ai/app-schema'
import { transformToMarkdown } from '@george-ai/file-converter'
import { ExtractionManifest, getDocument, getLibrary } from '@george-ai/file-management'

import { logger } from '../common'
import { DomainError } from '../error'
import { fixMissingLibraryManifest } from '../library'

export async function transform(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentId: string
    extractionMethod: ExtractionMethod
  },
): Promise<ExtractionManifest> {
  const { libraryId, documentId, extractionMethod } = parameters

  const libraryManifest = await getLibrary({ workspaceId: workspaceId, libraryId })
  if (!libraryManifest) {
    await fixMissingLibraryManifest(libraryId)
  }

  const document = await getDocument({ workspaceId, libraryId, documentId })
  if (!document) {
    throw new DomainError('Document not found', 'document')
  }

  logger.info('Transforming', { workspaceId, parameters, document })

  return await transformToMarkdown({
    document,
    timeoutSignal: new AbortController().signal,
    options: {
      extractionMethod,
    },
  })
}
