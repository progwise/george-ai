import { ExtractionMethod } from '@george-ai/app-commons'
import { publishProcessingRequest } from '@george-ai/event-service-client'
import { DocumentManifest } from '@george-ai/file-management'

export async function triggerExtraction(params: {
  documentManifest: DocumentManifest
  extractionMethod: ExtractionMethod
}): Promise<void> {
  const { documentManifest, extractionMethod } = params
  const { workspaceId, libraryId, documentId } = documentManifest

  await publishProcessingRequest({
    version: 1,
    workspaceId,
    libraryId,
    documentId,
    requestType: 'extractFile',
    extractionMethod,
  })
}
