import { ExtractionMethod } from '@george-ai/app-schema'
import { publish } from '@george-ai/event-service-client'
import { DocumentExtractionRequest } from '@george-ai/event-service-client/src/action/schema'
import { getAvailableMethodsForMimeType } from '@george-ai/file-converter'
import { DocumentManifest } from '@george-ai/file-management'

export async function triggerExtraction(params: {
  documentManifest: DocumentManifest
  extractionMethod?: ExtractionMethod | null
}): Promise<void> {
  const { documentManifest, extractionMethod } = params
  const { workspaceId, libraryId, documentId } = documentManifest

  const allMatchingExtractionMethods = getAvailableMethodsForMimeType(documentManifest.mimeType).map(
    (method) => method.extractionMethod,
  )
  const extractionMethods = extractionMethod ? [extractionMethod] : allMatchingExtractionMethods

  const requests: DocumentExtractionRequest[] = extractionMethods.map((extractionMethod) => ({
    version: 1,
    workspaceId,
    libraryId,
    documentId,
    action: 'documentExtraction',
    extractionMethod,
    verb: 'request',
    timestamp: new Date(),
  }))

  await Promise.all(requests.map((request) => publish(request)))
}
