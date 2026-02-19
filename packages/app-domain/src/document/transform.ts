import { ExtractionMethod } from '@george-ai/app-commons'
import { transformToMarkdown } from '@george-ai/file-converter'
import { ExtractionManifest, document, library } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function transform(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentId: string
    extractionMethod: ExtractionMethod
  },
): Promise<ExtractionManifest> {
  const { libraryId, documentId, extractionMethod } = parameters

  const libraryManifest = await library.get(workspaceId, { libraryId })
  if (!libraryManifest) {
    throw new DomainError('Library not found', 'document')
  }

  const manifest = await document.get(workspaceId, { libraryId, documentId })
  if (!manifest) {
    throw new DomainError('Document not found', 'document')
  }

  return await transformToMarkdown({
    workspaceId,
    libraryId,
    documentId,
    timeoutSignal: new AbortController().signal,
    options: {
      extractionMethod,
    },
  })
}
