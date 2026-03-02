import { getLibraryManifest, transform } from '@george-ai/app-domain'
import {
  ChatCompletionCall,
  ExtractDocumentRequest,
  requestModelCall,
  workspaceProcessing,
} from '@george-ai/event-service-client'
import { writeExtraction } from '@george-ai/file-management'

import { logger } from '../common'

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
      fileName: att.fileName,
      mimeType: att.mimeType,
    })) || []

  const chatCompletionRequest: ChatCompletionCall = {
    version: 1,
    workspaceId,
    provider: imageAnalysisSettings.provider,
    modelName: imageAnalysisSettings.modelName,
    modelCallType: 'generateChatCompletion',
    messages: [
      {
        role: 'system',
        content: `You are a high-fidelity OCR and document-to-markdown converter. 
    Your goal is to transcribe images into Markdown. 
    - Maintain the visual hierarchy (use # for titles, | for tables).
    - If you see a list, use markdown bullets.
    - Do not describe the image; only output the text found within it.`,
      },
      {
        role: 'user',
        content: `Below are ${attachmentsToProcess.length} images. Please convert them to Markdown:
    ${attachmentsToProcess.map((a, i) => `[Image ${i + 1}: ${a.fileName}]`).join('\n')}`,
      },
    ],
    attachments: attachmentsToProcess,
  }

  const response = await requestModelCall(chatCompletionRequest).catch((error) => {
    logger.error('Error requesting image chat completion from provider', { chatCompletionRequest, error })
    throw error
  })

  const extractionWriter = await writeExtraction({ extraction })

  try {
    if (response.resultStatus !== 'success') {
      await extractionWriter.write(
        `
    ## Image Analysis Report

    Timestamp: ${new Date()}

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

    if (response.resultStatus === 'success' && (!response.chunks || response.chunks.length === 0)) {
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

    if (response.resultStatus === 'success' && response.chunks && response.chunks.length > 0) {
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
