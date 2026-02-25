import { ProcessingRequestType } from '@george-ai/app-commons'
import { workspaceProcessing } from '@george-ai/event-service-client'
import { isMethodAvailableForMimeType } from '@george-ai/file-converter'
import { DocumentManifest } from '@george-ai/file-management'

import { getProcessingSettings } from './processing-settings'

export async function processDocument(params: {
  documentManifest: DocumentManifest
  fragment?: number | null
  requestType: ProcessingRequestType
}): Promise<void> {
  const { documentManifest, fragment, requestType } = params
  const { workspaceId, libraryId, documentId, mimeType } = documentManifest
  const settings = await getProcessingSettings({ libraryId, workspaceId })

  if (fragment !== undefined && (requestType === 'embedFile' || requestType === 'extractFile')) {
    throw new Error(`Fragment parameter is not applicable for ${requestType} action`)
  }

  const extractionMethods = settings.extractionMethods.filter((extractionMethod) =>
    isMethodAvailableForMimeType(extractionMethod, mimeType),
  )

  switch (requestType) {
    case 'extractFile':
      await Promise.all(
        extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishProcessingRequest({
            version: 1,
            workspaceId,
            libraryId,
            documentId,
            requestType: 'extractFile',
            extractionMethod,
          }),
        ),
      )
      break
    case 'embedFile':
      await Promise.all(
        extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishProcessingRequest({
            version: 1,
            workspaceId,
            libraryId,
            documentId,
            requestType: 'embedFile',
            embeddingModelProvider: settings.embeddingModelProvider,
            embeddingModelName: settings.embeddingModelName,
            extractionMethod,
          }),
        ),
      )
      break
    case 'enrichItem':
      await workspaceProcessing.publishProcessingRequest({
        version: 1,
        workspaceId,
        libraryId,
        documentId,
        fragment,
        requestType: 'enrichItem',
      })
      break
    default:
      throw new Error(`Unsupported action type: ${params.requestType}`)
  }
}
