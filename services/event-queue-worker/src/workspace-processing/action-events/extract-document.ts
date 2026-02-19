import { getLibraryManifest, transform } from '@george-ai/app-domain'
import { ExtractDocumentRequest, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'

import { logger } from '../../common'

export async function extractDocument(event: ExtractDocumentRequest) {
  const { extractionMethod, documentId, workspaceId, libraryId, requestType, version } = event
  logger.debug('Starting file extraction', {
    documentId,
    workspaceId,
    libraryId,
    extractionMethod,
    requestType,
    version,
  })

  const extraction = await transform(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
  })

  await workspaceProcessing.publishProcessingStatus({
    version: 1,
    workspaceId,
    requestType: 'extractFile',
    status: 'completed',
    documentId,
    libraryId,
    extractionMethod,
    timestamp: new Date().toISOString(),
  })

  const library = await getLibraryManifest(workspaceId, { libraryId })
  const imageAnalysisSettings = library.settings?.imageAnalysis
  if (imageAnalysisSettings) {
    const imageAttachments = extraction.attachments?.filter((att) => att.mimeType?.startsWith('image/')) || []
    const attachments =
      imageAttachments.map((att) => ({
        workspaceId,
        libraryId,
        documentId,
        extractionMethod,
        attachmentFileName: att.fileName,
      })) || []

    if (imageAttachments.length > 0) {
      await modelCalls.publishProviderCallEvent({
        version: 1,
        workspaceId,
        provider: imageAnalysisSettings.provider,
        modelName: imageAnalysisSettings.modelName,
        modelCallType: 'generateChatCompletion',
        messages: [
          {
            role: 'user',
            content: `Provide a detailed analysis of the following images:\n${imageAttachments
              .map((att) => `- ${att.fileName} (MIME type: ${att.mimeType})`)
              .join('\n')}\nInclude observations about content, style, and any notable features.`,
          },
        ],
        attachments,
      })

      logger.info('Published image analysis provider call', {
        documentId,
        workspaceId,
        libraryId,
        extractionMethod,
        provider: imageAnalysisSettings.provider,
        modelName: imageAnalysisSettings.modelName,
        timestamp: new Date().toISOString(),
      })
    }
  }

  logger.info('Completed file extraction', {
    documentId,
    workspaceId,
    libraryId,
    extractionMethod,
  })
}
