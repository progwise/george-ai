import { DocumentIdentifier, getDocument, readExtraction } from '@george-ai/file-management'

import { DomainError } from '../error'

export async function readActiveExtractions(
  identifier: DocumentIdentifier,
  fragment?: number,
): Promise<AsyncIterable<string>> {
  const document = await getDocument(identifier)
  if (!document) {
    throw new DomainError('Document not found', 'document')
  }

  const { workspaceId, libraryId, documentId } = identifier

  const activeExtractions = document.extractions.filter((extraction) => extraction.sourceHash === document.sourceHash)

  const extractionStreams = activeExtractions.map(async (extraction) =>
    readExtraction(
      {
        version: 1,
        type: 'extraction',
        workspaceId,
        libraryId,
        documentId,
        extractionMethod: extraction.extractionMethod,
      },
      fragment,
    ),
  )

  async function* extr() {
    for await (const { stream } of extractionStreams) {
      for await (const chunk of stream) {
        yield chunk
      }
    }
  }

  return extr()
}
