import { ProcessingRequestType } from '@george-ai/app-commons'
import { workspaceProcessing } from '@george-ai/event-service-client'

import { getProcessingSettings } from './processing-settings'

export async function processFile(params: {
  workspaceId: string
  libraryId: string
  fileId: string
  fragment?: number | null
  requestType: ProcessingRequestType
}): Promise<void> {
  const { libraryId, workspaceId, fileId, fragment, requestType } = params
  const settings = await getProcessingSettings({ libraryId, workspaceId })

  if (fragment !== undefined && (requestType === 'embedFile' || requestType === 'extractFile')) {
    throw new Error(`Fragment parameter is not applicable for ${requestType} action`)
  }
  switch (requestType) {
    case 'extractFile':
      await Promise.all(
        settings.extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishProcessingRequest({
            version: 1,
            workspaceId,
            libraryId,
            documentId: fileId,
            requestType: 'extractFile',
            extractionMethod,
          }),
        ),
      )
      break
    case 'embedFile':
      await Promise.all(
        settings.extractionMethods.map((extractionMethod) =>
          workspaceProcessing.publishProcessingRequest({
            version: 1,
            workspaceId,
            libraryId,
            documentId: fileId,
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
        documentId: fileId,
        fragment,
        requestType: 'enrichItem',
      })
      break
    default:
      throw new Error(`Unsupported action type: ${params.requestType}`)
  }
}
