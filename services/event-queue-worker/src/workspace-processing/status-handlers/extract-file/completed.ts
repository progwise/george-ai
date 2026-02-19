import { getExtraction, getLibraryManifest } from '@george-ai/app-domain'
import { ExtractDocumentStatus, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'

import { logger } from '../../../common'

export async function extractDocumentCompleted(event: ExtractDocumentStatus) {
  const { extractionMethod, documentId, workspaceId, libraryId } = event

  const extraction = await getExtraction(workspaceId, {
    libraryId,
    documentId,
    extractionMethod,
  })
  if (!extraction) {
    logger.error('Extraction not found', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
    })
    throw new Error('Extraction not found')
  }
  const library = await getLibraryManifest(workspaceId, { libraryId })
  const imageAnalysisSettings = library?.settings?.imageAnalysis
  if (imageAnalysisSettings) {
    const imageAttachments = extraction.attachments?.filter((att) => att.mimeType?.startsWith('image/')) || []
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
        attachments:
          imageAttachments.map((att) => ({
            workspaceId,
            libraryId,
            documentId,
            extractionMethod,
            attachmentFileName: att.fileName,
          })) || [],
        replySubject: workspaceProcessing.getEventSubject({ ...event, eventType: 'reply' }),
        context: { documentId, libraryId, extractionMethod },
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
}
