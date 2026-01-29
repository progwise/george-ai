import { ExtractFileStatus, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'
import { workspaceStorage } from '@george-ai/file-management'

import { logger } from '../../../common'

export async function extractFileCompleted(event: ExtractFileStatus) {
  const { extractionMethod, fileId, workspaceId, libraryId } = event

  const extraction = await workspaceStorage.getExtraction(workspaceId, {
    libraryId,
    fileId,
    extractionMethod,
  })
  if (!extraction) {
    logger.error('Extraction not found', {
      fileId,
      workspaceId,
      libraryId,
      extractionMethod,
    })
    throw new Error('Extraction not found')
  }
  const library = await workspaceStorage.getLibrary(workspaceId, { libraryId })
  const imageAnalysisSettings = library?.settings.imageAnalysis
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
              .map((att) => `- ${att.filename}`)
              .join('\n')}\nInclude observations about content, style, and any notable features.`,
          },
        ],
        attachmentFilePaths: await Promise.all(
          imageAttachments.map((att) =>
            workspaceStorage.getAttachmentFilePath(workspaceId, {
              libraryId,
              fileId,
              extractionMethod,
              attachmentFileName: att.filename,
            }),
          ),
        ).then((paths) => paths.filter((path): path is string => !!path)),
        timestamp: new Date().toISOString(),
        replySubject: workspaceProcessing.getReplySubject(event),
        context: { fileId, libraryId, extractionMethod },
      })

      logger.info('Published image analysis provider call', {
        fileId,
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
