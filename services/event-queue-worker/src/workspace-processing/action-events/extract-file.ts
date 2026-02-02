import { ExtractFileAction, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'
import { transformToMarkdown } from '@george-ai/file-converter'
import { workspaceStorage } from '@george-ai/file-management'

import { logger } from '../../common'

export async function extractFile(event: ExtractFileAction) {
  const { extractionMethod, fileId, workspaceId, libraryId, actionType, version } = event
  logger.debug('Starting file extraction', {
    fileId,
    workspaceId,
    libraryId,
    extractionMethod,
    actionType,
    version,
  })

  const extraction = await transformToMarkdown({
    workspaceId,
    libraryId,
    fileId,
    timeoutSignal: new AbortController().signal,
    options: {
      extractionMethod,
    },
  })

  await workspaceProcessing.publishStatusEvent({
    version: 1,
    workspaceId,
    actionType: 'extractFile',
    status: 'completed',
    fileId,
    libraryId,
    extractionMethod,
    timestamp: new Date().toISOString(),
  })

  const library = await workspaceStorage.getLibrary(workspaceId, { libraryId })
  const imageAnalysisSettings = library?.settings.imageAnalysis
  if (imageAnalysisSettings) {
    const imageAttachments = extraction.attachments?.filter((att) => att.mimeType?.startsWith('image/')) || []
    const attachmentFilePaths = await Promise.all(
      imageAttachments.map((att) =>
        workspaceStorage.getAttachmentFilePath(workspaceId, {
          libraryId,
          fileId,
          extractionMethod,
          attachmentFileName: att.filename,
        }),
      ),
    )
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
        attachmentFilePaths: attachmentFilePaths.filter((path): path is string => !!path),
        timestamp: new Date().toISOString(),
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

  logger.info('Completed file extraction', {
    fileId,
    workspaceId,
    libraryId,
    extractionMethod,
  })
}
