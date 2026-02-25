import { getLibraryManifest, transform } from '@george-ai/app-domain'
import { ExtractDocumentRequest, modelCalls, workspaceProcessing } from '@george-ai/event-service-client'
import { writeExtraction } from '@george-ai/file-management'

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
  const imageAttachments = extraction.attachments.filter((att) => att.mimeType?.startsWith('image/')) || []
  if (imageAttachments.length === 0) {
    logger.info('No image attachments found, skipping image analysis provider call', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
    })
    return
  }
  const library = await getLibraryManifest(workspaceId, { libraryId })
  const imageAnalysisSettings = library.settings?.imageAnalysis
  if (!imageAnalysisSettings) {
    logger.info('Image analysis settings not found for library, skipping image analysis provider call', {
      libraryId,
      workspaceId,
    })
    return
  }
  const attachmentsToProcess =
    imageAttachments.map((att) => ({
      workspaceId,
      libraryId,
      documentId,
      extractionMethod,
      attachmentFileName: att.fileName,
    })) || []

  const response = await modelCalls.directModelCall({
    version: 1,
    workspaceId,
    provider: imageAnalysisSettings.provider,
    modelName: imageAnalysisSettings.modelName,
    modelCallType: 'generateChatCompletion',
    messages: [
      {
        role: 'user',
        content: `Provide a markdown that represents the content of the following images:\n${imageAttachments
          .map((att) => `- ${att.fileName} (MIME type: ${att.mimeType})`)
          .join('\n')}
          Include observations about content, style, and any notable features.
          The markdown should be in the following format:
          ## Image Analysis Report

          ${imageAttachments.map(
            (att) => `### ${att.fileName}
          ### ${att.fileName}
          - **Content**: Exact text read from the image.
          - **Tables and numbers**: Any tables or numbers read from the image, represented in markdown format.
          - **Style**: Description of the style of the image (e.g., colors, composition).
          - **Notable Features**: Any notable features or observations about the image.`,
          )}

          `,
      },
    ],
    attachments: attachmentsToProcess,
  })

  const extractionWriter = await writeExtraction({ extraction })

  try {
    if (response.resultStatus !== 'success') {
      await extractionWriter.write(
        `
    ## Image Analysis Report

    Failed to analyze images with provider ${imageAnalysisSettings.provider} and model ${imageAnalysisSettings.modelName}.`,
      )
      logger.error('Image analysis provider call failed', {
        documentId,
        workspaceId,
        libraryId,
        extractionMethod,
        provider: imageAnalysisSettings.provider,
        modelName: imageAnalysisSettings.modelName,
        response,
      })
    }

    if (response.resultStatus === 'success' && response.chunks.length === 0) {
      await extractionWriter.write(
        `
    ## Image Analysis Report

    The image analysis provider ${imageAnalysisSettings.provider} and model ${imageAnalysisSettings.modelName} returned an empty response.`,
      )
      logger.warn('Image analysis provider call returned empty response', {
        documentId,
        workspaceId,
        libraryId,
        extractionMethod,
        provider: imageAnalysisSettings.provider,
        modelName: imageAnalysisSettings.modelName,
      })
    }

    if (response.resultStatus === 'success' && response.chunks.length > 0) {
      await extractionWriter.write(
        `
    ## Image Analysis Report

    Successfully analyzed ${imageAttachments.length} images with provider ${imageAnalysisSettings.provider} and model ${imageAnalysisSettings.modelName}.`,
      )

      await extractionWriter.write(
        `
    ## Image Analysis Details

    ${response.chunks.join('\n')}
    `,
      )

      logger.info('Image analysis provider call succeeded', {
        documentId,
        workspaceId,
        libraryId,
        extractionMethod,
        provider: imageAnalysisSettings.provider,
        modelName: imageAnalysisSettings.modelName,
      })
    }

    await extractionWriter.ack()
  } catch (error) {
    logger.error('Error during document extraction', {
      documentId,
      workspaceId,
      libraryId,
      extractionMethod,
      error: error instanceof Error ? error.message : String(error),
    })
    await extractionWriter.nack(error instanceof Error ? error : undefined)
  }
}
